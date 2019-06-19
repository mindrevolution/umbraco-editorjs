using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using Umbraco.Core.IO;
using Umbraco.Core.PropertyEditors;

namespace Our.Umbraco.EditorJs.DataEditors
{
    internal class EditorJsConfigurationEditor : ConfigurationEditor
    {
        public EditorJsConfigurationEditor()
        {
            var items = GetTools();

            Fields.Add(new ConfigurationField
            {
                Key = "tools",
                Name = "Tools",
                Description = "Select the block tools to configure for the editor.",
                View = IOHelper.ResolveUrl("~/App_Plugins/Editorjs/settings-tools.html"),
                Config = new Dictionary<string, object>
                {
                    { "items", items }
                }
            });

            Fields.Add(new ConfigurationField
            {
                Key = "hideLabel",
                Name = "Hide label?",
                Description = "Select to hide the label and have the editor take up the full width of the panel.",
                View = IOHelper.ResolveUrl("~/umbraco/views/propertyeditors/boolean/boolean.html"),
                Config = new Dictionary<string, object>
                {
                    { "default", "1" }
                }
            });
        }

        private IEnumerable<Tool> GetTools()
        {
            var path = IOHelper.MapPath("~/App_Plugins/Editorjs/editorjs-tools-config.js");
            if (File.Exists(path) == false)
                return null; // TODO: What to do here?

            var contents = File.ReadAllText(path);
            if (string.IsNullOrWhiteSpace(contents))
                return null; // TODO: What to do here?

            return JsonConvert.DeserializeObject<IEnumerable<Tool>>(contents);
        }

        public class Tool
        {
            [JsonProperty("key")]
            public string Key { get; set; }

            [JsonProperty("icon")]
            public string Icon { get; set; }

            [JsonProperty("name")]
            public string Name { get; set; }

            [JsonProperty("description")]
            public string Description { get; set; }

            [JsonProperty("path")]
            public string Path { get; set; }

            [JsonProperty("config")]
            public object Config { get; set; }
        }
    }
}
