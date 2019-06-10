using System.Collections.Generic;
using System.IO;
using System.Linq;
using Umbraco.Core;
using Umbraco.Core.IO;
using Umbraco.Core.PropertyEditors;

namespace Our.Umbraco.EditorJs.DataEditors
{
    internal class EditorJsConfigurationEditor : ConfigurationEditor
    {
        public EditorJsConfigurationEditor()
        {
            var items = GetBlocks();

            Fields.Add(new ConfigurationField
            {
                Name = "Blocks",
                Description = "Configure the blocks available.",
                Key = "blocks",
                View = IOHelper.ResolveUrl("~/App_Plugins/Editorjs/settings-blocks.html"),
                Config = new Dictionary<string, object>
                {
                    { "items", items }
                }
            });
        }

        private List<object> GetBlocks()
        {
            var items = new List<object>();

            var path = IOHelper.MapPath("~/App_Plugins/Editorjs/Lib/blocks/");
            var files = Directory
                .GetFiles(path, "*.js", SearchOption.TopDirectoryOnly)
                .OrderBy(x => x);

            foreach (var file in files)
            {
                // - use ".min" variant if existing (and omit non-minified version of the file in that event)
                if (files.Contains(file.Replace(".js", ".min.js")))
                    continue;

                var filename = Path.GetFileName(file);

                var displayName = filename
                    .Replace(".min.js", string.Empty)
                    .Replace(".js", string.Empty)
                    .ToFirstUpperInvariant()
                    .SplitPascalCasing();

                items.Add(new
                {
                    name = displayName,
                    value = filename
                });
            }

            return items;
        }
    }
}
