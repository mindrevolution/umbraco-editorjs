using System.Collections.Generic;
using Umbraco.Core;
using Umbraco.Core.PropertyEditors;

namespace Our.Umbraco.EditorJs.DataEditors
{
    public class EditorJsDataValueEditor : DataValueEditor
    {
        public EditorJsDataValueEditor(DataEditorAttribute attribute)
            : base(attribute)
        { }

        public override object Configuration
        {
            get => base.Configuration;
            set
            {
                base.Configuration = value;

                if (value is Dictionary<string, object> config && config.ContainsKey("hideLabel"))
                {
                    // NOTE: This is how NestedContent handles this in core. Looks like a code-smell to me. [LK:2019-06-12]
                    // https://github.com/umbraco/Umbraco-CMS/blob/release-8.0.2/src/Umbraco.Web/PropertyEditors/NestedContentPropertyEditor.cs#L72-L82
                    // I don't think "display logic" should be done inside the setter.
                    // Where is the best place to do this? I'd assume `ToEditor`, but the `Configuration` is null/empty?!
                    HideLabel = config["hideLabel"].TryConvertTo<bool>().Result;
                }
            }
        }
    }
}
