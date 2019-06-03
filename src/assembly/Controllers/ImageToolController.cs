using System.Web;
using Umbraco.Web.WebApi;
using Umbraco.Web.Editors;
using System.Web.Http;
using Editorjs.Helpers;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core;
using System.Web.Http.Results;
using Editorjs.Models;
using System.IO;
using Newtonsoft.Json;

namespace Editorjs.Controllers
{
    [Umbraco.Web.Mvc.PluginController("EditorJs"), IsBackOffice]
    public class ImageToolController : UmbracoAuthorizedJsonController
    {
        public ImageToolController() { }

        [HttpPost]
        // - /umbraco/backoffice/EditorJs/ImageTool/UploadByFile
        public JsonResult<UploadResponse> UploadByFile()
        {
            UploadResponse r = new UploadResponse(0);
            var ctx = HttpContext.Current;
            var request = ctx.Request;
            var imagefile = request.Files["image"];
            if (imagefile != null)
            {
                // - save uploaded file to the default upload-temp of Umbraco
                string tempfile = string.Format("/App_Data/TEMP/FileUploads/{0}{1}", System.Guid.NewGuid(), System.IO.Path.GetExtension(imagefile.FileName));
                string filepath = ctx.Server.MapPath(tempfile);

                imagefile.SaveAs(filepath);
                IPublishedContent media = MediaHelper.AddImageByFile(Services.MediaService, Services.ContentTypeBaseServices, Umbraco, imagefile.FileName, filepath);

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
            UploadResponse r = new UploadResponse(0);
            var ctx = HttpContext.Current;
            var request = ctx.Request;
            string payload;
            using (Stream receiveStream = request.InputStream)
            {
                using (StreamReader readStream = new StreamReader(receiveStream, request.ContentEncoding))
                {
                    payload = readStream.ReadToEnd();
                }
            }

            if (!string.IsNullOrWhiteSpace(payload))
            {
                dynamic plobj = JsonConvert.DeserializeObject(payload);
                string imageurl = (string)plobj.url;

                if (!string.IsNullOrEmpty(imageurl))
                {
                    // - download the link's file content to the default upload-temp of Umbraco
                    IPublishedContent media = MediaHelper.AddImageByUrl(Services.MediaService, Services.ContentTypeBaseServices, Umbraco, imageurl);

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
    }
}