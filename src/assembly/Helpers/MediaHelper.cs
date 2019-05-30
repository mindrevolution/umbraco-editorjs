using System.Web.Mvc;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Core.Services;
using Umbraco.Web;
using System.Linq;
using System.Web;
using System.IO;
using Umbraco.Core.Models.PublishedContent;

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


        public static IPublishedContent AddImageUpload(IMediaService mediaService, IContentTypeBaseServiceProvider contentTypeBaseServiceProvider, UmbracoHelper umbraco, string filename, string tempfile)
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
    }
}
