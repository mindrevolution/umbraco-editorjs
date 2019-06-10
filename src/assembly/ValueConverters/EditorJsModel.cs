using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Our.Umbraco.EditorJs.ValueConverters
{
    public class EditorJsModel
    {
        [JsonProperty("time")]
        public long Time { get; set; }

        [JsonProperty("blocks")]
        public IEnumerable<Block> Blocks { get; set; }

        public class Block
        {
            [JsonProperty("type")]
            public string Type { get; set; }

            [JsonProperty("data")]
            public object Data { get; set; }
        }

        public override string ToString()
        {
            return JsonConvert.SerializeObject(this, Formatting.Indented);
        }
    }
}
