using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Umbraco.Web.WebApi;
using Umbraco.Web.Editors;
using Umbraco.Core.Persistence;
using System.Net.Http;

namespace Editorjs.Controllers
{
    [Umbraco.Web.Mvc.PluginController("Editorjs"), IsBackOffice]
    public class SettingsApiController : UmbracoAuthorizedJsonController
    {
        public SettingsApiController() { }

        private List<Block> FindBlocks()
        {
            string blocksroot = "/App_Plugins/Editorjs/Lib/blocks/";
            List<Block> blocks = new List<Block>();
            Block b;

            string[] jsfiles = System.IO.Directory.GetFiles(System.Web.HttpContext.Current.Server.MapPath(blocksroot), "*.js", System.IO.SearchOption.TopDirectoryOnly);
            foreach (string filename in jsfiles)
            {
                try {
                    // - use ".min" variant if existing (and omit non-minified version of the file in that event)
                    if (!jsfiles.Contains(filename.Replace(".js",".min.js")))
                    {
                        b = new Block();
                        b.Filename = System.IO.Path.GetFileName(filename);
                        blocks.Add(b);
                    }
                }
                catch { }
            }

            return blocks;

        }

        public IEnumerable<Block> GetBlocks()
        {
            // - just return the original list for now
            return FindBlocks();
        }

        public IEnumerable<Block> GetGridEditorBlocksConfiguration()
        {
            // - TODO!! ****************************************
            return GetBlocks();
        }
    }

    public class Block
    {
        public string Filename { get; set; }
        public bool Active { get; set; }
        public string Config { get; set; }

        public Block()
        {
        }

        public Block(string filename, bool active, string config)
        {
            this.Filename = filename;
            this.Active = active;
            this.Config = config;
        }
        public Block(string filename, bool active) : this(filename, active, "") {}
        public Block(string filename) : this(filename, false, "") {}
    }

}