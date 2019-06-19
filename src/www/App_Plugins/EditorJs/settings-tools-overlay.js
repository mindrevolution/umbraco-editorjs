angular.module("umbraco").controller("Our.Umbraco.Editorjs.SettingsToolsOverlay.Controller", [
    "$scope",
    function ($scope) {

        //console.log("editorjs.overlay.model", $scope.model);

        var defaultConfig = { mode: "select", items: {} };
        var config = angular.extend({}, defaultConfig, $scope.model.config);

        var vm = this;

        function init() {

            vm.mode = config.mode;

            if (vm.mode === "select") {
                vm.title = "Select a tool...";
                vm.defaultIcon = "icon-settings-alt";
                vm.items = config.items;
                vm.select = select;

            } else if (vm.mode === "configure") {
                configure($scope.model.value);
            }

            vm.close = close;
        };

        function configure(item) {

            vm.title = "Configure " + item.name;
            vm.selectedItem = item;

            if (_.has(item.config, "config") && !!item.config.config) {

                vm.config = JSON.stringify(item.config.config, null, 2);

                vm.aceOptions = {
                    autoFocus: true,
                    showGutter: true,
                    disableSearch: true,
                    theme: "chrome",
                    mode: "javascript",
                    advanced: {
                        fontSize: "14px"
                    }
                };

                vm.save = save;
            }
        };

        function select(item) {
            // If there is no inner config, we can save & close the overlay
            if (_.has(item.config, "config") === false) {
                save(item);
            } else {
                vm.mode = "configure";
                configure(item);
            }
        };

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        };

        function save(item, config) {
            if (config && _.has(item.config, "config")) {
                item.config.config = JSON.parse(config);
            }

            if ($scope.model.submit) {
                $scope.model.submit(item);
            }
        };

        init();
    }
]);
