using System.Web.Http;
using System.Web.Http.Results;
using Umbraco.Web.Editors;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;
using HtmlAgilityPack;

namespace Our.Umbraco.EditorJs.Controllers
{
    [PluginController("EditorJs"), IsBackOffice]
    public class LinkToolController : UmbracoAuthorizedJsonController
    {
        [HttpGet]
        public JsonResult<LinkMetaResponse> FetchUrl(string url)
        {
            // Eh up, I found this on Paul (from Code Share)'s blog!
            // https://codeshare.co.uk/blog/how-to-scrape-meta-data-from-a-url-using-htmlagilitypack-in-c/

            var webGet = new HtmlWeb();
            var document = webGet.Load(url);
            var metaTags = document.DocumentNode.SelectNodes("//meta");

            var metaInfo = new LinkMetaResponse.Meta();

            if (metaTags != null)
            {
                foreach (var tag in metaTags)
                {
                    var tagName = tag.Attributes["name"];
                    var tagContent = tag.Attributes["content"];
                    var tagProperty = tag.Attributes["property"];

                    if (tagName != null && tagContent != null)
                    {
                        switch (tagName.Value.ToLower())
                        {
                            case "title":
                                metaInfo.title = tagContent.Value;
                                break;
                            case "description":
                                metaInfo.description = tagContent.Value;
                                break;
                            case "twitter:title":
                                metaInfo.title = string.IsNullOrEmpty(metaInfo.title) ? tagContent.Value : metaInfo.title;
                                break;
                            case "twitter:description":
                                metaInfo.description = string.IsNullOrEmpty(metaInfo.description) ? tagContent.Value : metaInfo.description;
                                break;
                            case "twitter:image":
                                metaInfo.image = metaInfo.image == null ? new LinkMetaResponse.Image { url = tagContent.Value } : metaInfo.image;
                                break;
                        }
                    }
                    else if (tagProperty != null && tagContent != null)
                    {
                        switch (tagProperty.Value.ToLower())
                        {
                            case "og:title":
                                metaInfo.title = string.IsNullOrEmpty(metaInfo.title) ? tagContent.Value : metaInfo.title;
                                break;
                            case "og:description":
                                metaInfo.description = string.IsNullOrEmpty(metaInfo.description) ? tagContent.Value : metaInfo.description;
                                break;
                            case "og:image":
                                metaInfo.image = metaInfo.image == null ? new LinkMetaResponse.Image { url = tagContent.Value } : metaInfo.image;
                                break;
                        }
                    }
                }
            }

            return Json(new LinkMetaResponse
            {
                success = 1,
                meta = metaInfo
            });
        }

        public class LinkMetaResponse
        {
            public int success { get; set; }
            public Meta meta { get; set; }

            public class Meta
            {
                public string title { get; set; }
                public string description { get; set; }
                public Image image { get; set; }
            }

            public class Image
            {
                public string url { get; set; }
            }
        }
    }
}
