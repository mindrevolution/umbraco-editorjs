using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Our.Umbraco.EditorJs.DataEditors;
using Umbraco.Core;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.PropertyEditors;

namespace Our.Umbraco.EditorJs.ValueConverters
{
    public class EditorJsValueConverter : PropertyValueConverterBase
    {
        public override bool IsConverter(PublishedPropertyType propertyType) => propertyType.EditorAlias.InvariantEquals(EditorJsDataEditor.DataEditorAlias);

        public override PropertyCacheLevel GetPropertyCacheLevel(PublishedPropertyType propertyType) => PropertyCacheLevel.Element;

        public override Type GetPropertyValueType(PublishedPropertyType propertyType) => typeof(EditorJsModel);

        public override object ConvertSourceToIntermediate(IPublishedElement owner, PublishedPropertyType propertyType, object source, bool preview)
        {
            if (source is string value)
            {
                return JsonConvert.DeserializeObject<EditorJsModel>(value);
            }

            return base.ConvertSourceToIntermediate(owner, propertyType, source, preview);
        }
    }
}
