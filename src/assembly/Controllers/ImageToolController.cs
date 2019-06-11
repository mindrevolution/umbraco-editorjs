using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Web.Http.Results;
using Newtonsoft.Json;
using Umbraco.Core;
using Umbraco.Core.IO;
using Umbraco.Core.Models;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.Services;
using Umbraco.Web;
using Umbraco.Web.Editors;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace Our.Umbraco.EditorJs.Controllers
{
    [PluginController("EditorJs"), IsBackOffice]
    public class ImageToolController : UmbracoAuthorizedJsonController
    {
        [HttpPost]
        // - /umbraco/backoffice/EditorJs/ImageTool/UploadByFile
        public JsonResult<UploadResponse> UploadByFile()
        {
            var r = new UploadResponse(0);
            var ctx = HttpContext.Current;
            var request = ctx.Request;
            var imagefile = request.Files["image"];
            if (imagefile != null)
            {
                // - save uploaded file to the default upload-temp of Umbraco
                var tempfile = string.Format("/App_Data/TEMP/FileUploads/{0}{1}", Guid.NewGuid(), Path.GetExtension(imagefile.FileName));
                var filepath = IOHelper.MapPath(tempfile);

                imagefile.SaveAs(filepath);
                var media = MediaHelper.AddImageByFile(Services.MediaService, Services.ContentTypeBaseServices, Umbraco, imagefile.FileName, filepath);

                r = MediaHelper.PrepareResponse(true, media);
            }

            // ** we need to return the value in this weird way to prevent the JSON auto-protection to kick in **
            //https://our.umbraco.com/forum/extending-umbraco-and-using-the-api/95105-umbracoauthorizedjsoncontroller-adds-garbled-json-to-front-of-all-results
            return Json(r);
        }

        [HttpPost]
        // - /umbraco/backoffice/EditorJs/ImageTool/UploadByUrl
        public JsonResult<UploadResponse> UploadByUrl()
        {
            var r = new UploadResponse(0);
            var ctx = HttpContext.Current;
            var request = ctx.Request;
            string payload;

            using (var receiveStream = request.InputStream)
            using (var readStream = new StreamReader(receiveStream, request.ContentEncoding))
            {
                payload = readStream.ReadToEnd();
            }

            if (string.IsNullOrWhiteSpace(payload) == false)
            {
                var plobj = JsonConvert.DeserializeAnonymousType(payload, new { url = default(string) });
                var imageurl = plobj.url;

                if (string.IsNullOrEmpty(imageurl) == false)
                {
                    // - download the link's file content to the default upload-temp of Umbraco
                    var media = MediaHelper.AddImageByUrl(Services.MediaService, Services.ContentTypeBaseServices, Umbraco, imageurl);

                    r = MediaHelper.PrepareResponse(true, media);
                }
            }

            return Json(r);
        }

        [HttpGet]
        public bool MoveMedia(Udi media, Udi folder)
        {
            // move to given parent
            return MediaHelper.MoveMedia(Services.MediaService, Services.EntityService, media, folder);
        }

        public class UploadResponse
        {
            public int success { get; set; }

            public UploadResponseFile file { get; set; }

            public UploadResponse(int success, string url, object udi)
            {
                this.success = success;

                if (success == 1)
                {
                    this.file = new UploadResponseFile(url, udi);
                }
            }

            public UploadResponse(int success) : this(success, string.Empty, string.Empty) { }
        }

        public class UploadResponseFile
        {
            public string url { get; set; }

            public string udi { get; set; }

            public UploadResponseFile(string url, object udi)
            {
                this.url = url;
                this.udi = udi.ToString();
            }
        }

        internal static class MediaHelper
        {
            static IMediaService _mediaService;
            static string _foldername = "Editorial Images";

            public static IMedia CreateFolder(string name, int parentId = -1)
            {
                var folder = GetFolder(name);

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
                var name = System.IO.Path.GetFileNameWithoutExtension(filename);

                // - place them inside of a folder!
                var folder = CreateFolder(_foldername);

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

                var urlFilename = Path.GetFileName(new System.Uri(url).LocalPath);
                var tempfile = string.Format("/App_Data/TEMP/FileUploads/{0}{1}", System.Guid.NewGuid(), System.IO.Path.GetExtension(urlFilename));
                tempfile = ctx.Server.MapPath(tempfile);

                // - TODO
                // - This effectively bypasses and upload limits configured on the server.
                // - You can easily file-bomb the host by providing a huge (scripted) response from a fast destination (sub timeout)
                // - To add fuel to the fire, WebClient has a built in default timeout of 100 seconds (yikes!)
                // - Also ... loading the image 'through' ImageSharp (or ImageProcesor) after download would
                // - ensure that is really is a valid image (and not an attack/trojan image for the frontend client)?
                using (var webclient = new WebClient())
                {
                    webclient.DownloadFile(url, tempfile);
                }

                return AddImageByFile(mediaService, contentTypeBaseServiceProvider, umbraco, urlFilename, tempfile);
            }

            public static Controllers.ImageToolController.UploadResponse PrepareResponse(bool success, IPublishedContent media = null)
            {
                if (media == null)
                {
                    return new Controllers.ImageToolController.UploadResponse(0);
                }
                else
                {
                    return new Controllers.ImageToolController.UploadResponse(
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
}
