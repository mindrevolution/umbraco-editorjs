using ClientDependency.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.PropertyEditors;
using Umbraco.Web.PropertyEditors;

namespace Our.Umbraco.EditorJs.DataEditors
{
    [DataEditor(
        DataEditorAlias,
        EditorType.PropertyValue,
        DataEditorName,
        DataEditorViewPath,
        Group = DataEditorGroup,
        HideLabel = true,
        Icon = DataEditorIcon,
        ValueType = ValueTypes.Json)]
    [PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/EditorJs/lib/editorjs/editor.js")]
    [PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/EditorJs/editorjs.js")]
    [PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/EditorJs/settings-blocks.js")]
    public class EditorJsDataEditor : DataEditor
    {
        internal const string DataEditorAlias = "Our.Umbraco.EditorJs";
        internal const string DataEditorName = "Editor.js";
        internal const string DataEditorViewPath = "~/App_Plugins/EditorJs/editorjs.html";
        internal const string DataEditorIcon = "icon-list";
        internal const string DataEditorGroup = "Rich Content";

        public EditorJsDataEditor(ILogger logger)
            : base(logger)
        { }

        protected override IConfigurationEditor CreateConfigurationEditor() => new EditorJsConfigurationEditor();
    }
}
