using System;
using System.IO;
using System.Web;
using System.Web.Http;
using System.Web.Http.Results;
using Newtonsoft.Json;
using Our.Umbraco.EditorJs.Helpers;
using Our.Umbraco.EditorJs.Models;
using Umbraco.Core;
using Umbraco.Core.IO;
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
    }
}
