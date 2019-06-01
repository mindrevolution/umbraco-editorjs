using System.Web;
using Umbraco.Web.WebApi;
using Umbraco.Web.Editors;
using System.Web.Http;
using Editorjs.Helpers;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core;
using System.Web.Http.Results;

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
                string tempfile = string.Format("/App_Data/TEMP/FileUploads/{0}{1}", System.Guid.NewGuid(), System.IO.Path.GetExtension(imagefile.FileName));
                var filepath = ctx.Server.MapPath(tempfile);

                //using (var fs = new System.IO.FileStream(filepath, System.IO.FileMode.Create))
                //{
                //    request.InputStream.CopyTo(fs);
                //}

                imagefile.SaveAs(filepath);
                IPublishedContent media = MediaHelper.AddImageUpload(Services.MediaService, Services.ContentTypeBaseServices, Umbraco, imagefile.FileName, filepath);

                
                r = new UploadResponse(1, string.Format("{0}?width={1}&mode=max&format=jpeg&quality=90", media.Url, imageEditorPreviewWidth), Udi.Create(Constants.UdiEntityType.Media, media.Key));
            }
            else
            {
                r = new UploadResponse(0);
            }

            // ** we need to return the value in this weired way to prevent the JSON auto-protection to kick in **
            //https://our.umbraco.com/forum/extending-umbraco-and-using-the-api/95105-umbracoauthorizedjsoncontroller-adds-garbled-json-to-front-of-all-results
            return Json(r);
        }
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

}