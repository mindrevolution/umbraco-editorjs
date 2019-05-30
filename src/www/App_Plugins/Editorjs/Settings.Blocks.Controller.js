angular.module("umbraco")
    .controller("Editorjs.Settings.Blocks.Controller", [ '$scope', 'editorjsSettingsResource', 
    function ($scope, editorjsSettingsResource) {
        
        editorjsSettingsResource.getBlocks().then(function (response) {
            $scope.blocks = response.data;

            // - existing assigments? Apply them (selected: true/false?)
            if ($scope.model.value !== null && $scope.model.value.length > 0) {
                angular.forEach($scope.blocks, function (item, index) {
                    var curmatch = $scope.getItemByName($scope.model.value, item.Name);

                    if (curmatch) {
                        $scope.blocks[index].Active = curmatch.Active;
                        //$scope.blocks[index].Mandatory = curmatch.Mandatory;
                        //$scope.blocks[index].Limit = curmatch.Limit;
                    }
                });
            }

            // - alright, everything merged
            $scope.model.value = $scope.blocks;
        });

        $scope.getItemByName = function (objects, itemName) {
            for (var i = 0; i < objects.length; i += 1) {
                var object = objects[i];

                if (object.Name === itemName) {
                    return object;
                }
            }
        };
    }]);