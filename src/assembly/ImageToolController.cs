using System.Web;
using Umbraco.Web.WebApi;
using Umbraco.Web.Editors;
using System.Web.Http;
using Editorjs.Helpers;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core;
using System.Web.Http.Results;
using Editorjs.Models;

namespace Editorjs.Controllers
{
    [Umbraco.Web.Mvc.PluginController("EditorJs"), IsBackOffice]
    public class ImageToolController : UmbracoAuthorizedJsonController
    {
        public int imageEditorPreviewWidth = 1000;

        public ImageToolController() { }

        [HttpPost]
        //http://localhost:64090/umbraco/backoffice/EditorJs/ImageTool/UploadByFile
        public JsonResult<UploadResponse> UploadByFile()
        {
            UploadResponse r;
            var ctx = HttpContext.Current;
            var request = ctx.Request;
            var imagefile = request.Files["image"];
            if (imagefile != null)
            {
                // - save uploaded file to the default upload-temp of Umbraco
                string tempfile = string.Format("/App_Data/TEMP/FileUploads/{0}{1}", System.Guid.NewGuid(), System.IO.Path.GetExtension(imagefile.FileName));
                var filepath = ctx.Server.MapPath(tempfile);

                imagefile.SaveAs(filepath);
                IPublishedContent media = MediaHelper.AddImageUpload(Services.MediaService, Services.ContentTypeBaseServices, Umbraco, imagefile.FileName, filepath);

                r = new UploadResponse(
                    1, // - success
                    string.Format("{0}?width={1}&mode=max&format=jpeg&quality=90", media.Url, imageEditorPreviewWidth), // - link to image for EditorJS: scale to max width, convert to JPEG with 90 % quality
                    Udi.Create(Constants.UdiEntityType.Media, media.Key)); // - add Udi to the result, so the frontenders can fetch the "real media" despite of any future changes
            }
            else
            {
                r = new UploadResponse(0);
            }

            // ** we need to return the value in this weird way to prevent the JSON auto-protection to kick in **
            //https://our.umbraco.com/forum/extending-umbraco-and-using-the-api/95105-umbracoauthorizedjsoncontroller-adds-garbled-json-to-front-of-all-results
            return Json(r);
        }
    }
}