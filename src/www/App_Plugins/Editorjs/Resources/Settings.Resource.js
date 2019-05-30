//- adds this resource to the umbraco.resources module
angular.module("umbraco.resources").factory("editorjsSettingsResource", ['$q', '$http',
    function ($q, $http) {
        // - return a factory object
        return {
            // - call the API controller
            getBlocks: function () {
                return $http.get("backoffice/EditorJs/SettingsApi/GetBlocks");
            }
            ,
            getGridEditorBlocksConfiguration: function () {
                return $http.get("backoffice/EditorJs/SettingsApi/getGridEditorBlocksConfiguration");
            }
        };
    }]
);