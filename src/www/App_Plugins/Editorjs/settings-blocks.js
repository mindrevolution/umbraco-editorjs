angular.module("umbraco").controller("Our.Umbraco.Editorjs.SettingsBlocks.Controller", [
    "$scope",
    function ($scope) {

        //console.log("editorjs.model", $scope.model);

        var defaultConfig = { items: [], defaultValue: [] };
        var config = angular.extend({}, defaultConfig, $scope.model.config);

        var vm = this;

        function init() {
            $scope.model.value = $scope.model.value || config.defaultValue;

            if (_.isArray($scope.model.value) === false) {
                $scope.model.value = [$scope.model.value];
            }

            vm.items = angular.copy(config.items);

            _.each(vm.items, function (item) {
                item.checked = _.contains($scope.model.value, item.value);
            });

            vm.changed = changed;
        };

        function changed(item) {
            $scope.model.value = [];

            _.each(vm.items, function (item) {
                if (item.checked) {
                    $scope.model.value.push(item.value);
                }
            });

            setDirty()
        };

        function setDirty() {
            if ($scope.propertyForm) {
                $scope.propertyForm.$setDirty();
            }
        };

        init();
    }
]);
