using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Core.Services;
using Umbraco.Web;
using System.Linq;
using System.IO;
using Umbraco.Core.Models.PublishedContent;
using System.Net;
using Editorjs.Models;
using System.Web;

namespace Editorjs.Helpers
{
    class MediaHelper
    {
        static IMediaService _mediaService;
        static string _foldername = "Editorial Images";

        public MediaHelper()
        {
        }

        public static IMedia CreateFolder(string name, int parentId = -1)
        {
            IMedia folder = GetFolder(name);

            if (folder == null)
            {
                folder = _mediaService.CreateMedia(name, parentId, "folder");
                _mediaService.Save(folder);
            }

            return folder;
        }

        public static IMedia GetFolder(string name, int parentId = -1)
        {
            var folder = _mediaService.GetRootMedia()
                .Where(m => m.ContentType.Name.InvariantEquals("folder") && m.Name.InvariantEquals(name))
                .FirstOrDefault();

            return folder;
        }

        //private System.Drawing.Image DownloadImageFromUrl(string imageUrl)
        //{
        //    System.Drawing.Image image = null;
        //    try
        //    {
        //        var webRequest = (HttpWebRequest)WebRequest.Create(imageUrl);
        //        webRequest.AllowWriteStreamBuffering = true;
        //        webRequest.Timeout = 30000;

        //        var webResponse = webRequest.GetResponse();
        //        var stream = webResponse.GetResponseStream();
        //        image = System.Drawing.Image.FromStream(stream);

        //        webResponse.Close();
        //    }
        //    catch (Exception ex)
        //    {
        //        // log the exception
        //    }
        //    return image;
        //}


        public static IPublishedContent AddImageByFile(IMediaService mediaService, IContentTypeBaseServiceProvider contentTypeBaseServiceProvider, UmbracoHelper umbraco, string filename, string tempfile)
        {
            _mediaService = mediaService;
            string name = System.IO.Path.GetFileNameWithoutExtension(filename);

            // - place them inside of a folder!
            IMedia folder = CreateFolder(_foldername);

            // - create media item in this folder, save file data and persist
            var media = _mediaService.CreateMedia(name, folder, "image");
            var buffer = System.IO.File.ReadAllBytes(tempfile);
            media.SetValue(contentTypeBaseServiceProvider, "umbracoFile", filename, new MemoryStream(buffer));
            _mediaService.Save(media);

            // - remove temp file!
            if (System.IO.File.Exists(tempfile))
            {
                System.IO.File.Delete(tempfile);
            }

            return umbraco.Media(media.Id);
        }

        public static IPublishedContent AddImageByUrl(IMediaService mediaService, IContentTypeBaseServiceProvider contentTypeBaseServiceProvider, UmbracoHelper umbraco, string url)
        {
            var ctx = HttpContext.Current;

            string urlFilename = Path.GetFileName(new System.Uri(url).LocalPath);
            string tempfile = string.Format("/App_Data/TEMP/FileUploads/{0}{1}", System.Guid.NewGuid(), System.IO.Path.GetExtension(urlFilename));
            tempfile = ctx.Server.MapPath(tempfile);

            // - TODO
            // - This effectively bypasses and upload limits configured on the server.
            // - You can easily file-bomb the host by providing a huge (scripted) response from a fast destination (sub timeout)
            // - To add fuel to the fire, WebClient has a built in default timeout of 100 seconds (yikes!)
            // - Also ... loading the image 'through' ImageSharp (or ImageProcesor) after download would
            // - ensure that is really is a valid image (and not an attack/trojan image for the frontend client)?
            using (WebClient webclient = new WebClient())
            {
                webclient.DownloadFile(url, tempfile);
            }

            return AddImageByFile(mediaService, contentTypeBaseServiceProvider, umbraco, urlFilename, tempfile);
        }

        public static UploadResponse PrepareResponse(bool success, IPublishedContent media = null)
        {
            if (media==null)
            {
                return new UploadResponse(0);
            }
            else
            {
                return new UploadResponse(
                        success ? 1 : 0,
                        string.Format("{0}?width=1000&mode=max&format=jpeg&quality=90", media.Url), // - link to image for EditorJS: scale to max width, convert to JPEG with 90 % quality
                        Udi.Create(Constants.UdiEntityType.Media, media.Key)); // - add Udi to the result, so the frontenders can fetch the "real media" despite of any future changes
            }
        }

        public static bool MoveMedia(IMediaService mediaService, IEntityService entityService, Udi media, Udi folder)
        {
             bool success = false;

            try
            {
                // - this is RIDICULOUS! Why no .key on Udi?
                var m = mediaService.GetById(entityService.GetId(media).Result);
                var f = mediaService.GetById(entityService.GetId(folder).Result);
                if (!f.ContentType.Alias.InvariantEquals("folder"))
                {
                    // go one up!
                    f = mediaService.GetById(f.ParentId);
                }
                var r = _mediaService.Move(m, f.Id);
                success = r.Result.Success;
            }
            catch { }

            return success;
        }
    }
}
