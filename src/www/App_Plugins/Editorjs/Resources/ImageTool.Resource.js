//- adds this resource to the umbraco.resources module
angular.module("umbraco.resources").factory("editorjsImageToolResource", ['$q', '$http',
    function ($q, $http) {
        // - return a factory object
        return {
            // - call the controller
            moveMedia: function (mediaUdi, folderUdi) {
                return $http({
                    url: "backoffice/EditorJs/ImageTool/MoveMedia",
                    method: "GET",
                    params: {
                        "media": mediaUdi,
                        "folder": folderUdi
                    }
                });
            }
        };
    }]
);