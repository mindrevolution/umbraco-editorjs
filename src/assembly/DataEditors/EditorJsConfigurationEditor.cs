using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using Umbraco.Core;
using Umbraco.Core.IO;
using Umbraco.Core.PropertyEditors;

namespace Our.Umbraco.EditorJs.DataEditors
{
    internal class EditorJsConfigurationEditor : ConfigurationEditor
    {
        public EditorJsConfigurationEditor()
        {
            var tools = GetTools();

            Fields.Add(new ConfigurationField
            {
                Name = "Tools",
                Description = "Select the tools to configure for the editor.",
                Key = "tools",
                View = IOHelper.ResolveUrl("~/App_Plugins/Editorjs/settings-tools.html"),
                Config = new Dictionary<string, object>
                {
                    { "tools", tools }
                }
            });
        }

        private Dictionary<string, IEnumerable<Tool>> GetTools()
        {
            var path = IOHelper.MapPath("~/App_Plugins/Editorjs/editorjs-tools-config.js");
            if (File.Exists(path) == false)
                return null; // TODO: What to do here?

            var contents = File.ReadAllText(path);
            if (string.IsNullOrWhiteSpace(contents))
                return null; // TODO: What to do here?

            return JsonConvert.DeserializeObject<Dictionary<string, IEnumerable<Tool>>>(contents);
        }

        public class Tool
        {
            [JsonProperty("key")]
            public string Key { get; set; }

            [JsonProperty("name")]
            public string Name { get; set; }

            [JsonProperty("description")]
            public string Description { get; set; }

            [JsonProperty("path")]
            public string Path { get; set; }

            [JsonProperty("config")]
            public object Config { get; set; }

            [JsonProperty("enabled")]
            public bool Enabled { get; set; }
        }

    }
}
