angular.module("umbraco").controller("Our.Umbraco.Editorjs.SettingsTools.Controller", [
    "$scope",
    "editorService",
    function ($scope, editorService) {

        //console.log("editorjs.model", $scope.model);

        var defaultConfig = { tools: {}, defaultValue: {} };
        var config = angular.extend({}, defaultConfig, $scope.model.config);

        var vm = this;

        function init() {
            $scope.model.value = $scope.model.value || config.defaultValue;

            if (_.isArray($scope.model.value)) {
                $scope.model.value = config.defaultValue;
            }

            vm.tools = angular.copy(config.tools);

            _.each(vm.tools, function (group) {
                _.each(group, function (item) {
                    item.enabled = _.has($scope.model.value, item.key) && $scope.model.value[item.key].enabled;
                });
            });

            vm.toggle = toggle;
            vm.configure = configure;
        };

        function toggle(item) {
            //console.log("toggle", item);
            item.enabled = item.enabled === false;

            if (_.has($scope.model.value, item.key)) {
                $scope.model.value[item.key].enabled = item.enabled;
                $scope.model.value[item.key].path = item.path;
            } else {
                $scope.model.value[item.key] = {
                    enabled: item.enabled,
                    path: item.path,
                    config: item.config
                };
            }

            setDirty();
        };

        function configure(item) {
            //console.log("configure", item);

            var innerConfig = _.has($scope.model.value, item.key)
                && _.has($scope.model.value[item.key], "config")
                && _.has($scope.model.value[item.key].config, "config")
                && $scope.model.value[item.key].config.config !== null
                ? $scope.model.value[item.key].config.config
                : item.config.config;

            var configureTool = {
                view: "/App_Plugins/EditorJs/settings-tools-configure.html",
                size: "small",
                value: JSON.stringify(innerConfig, null, 2),
                submit: function (model) {

                    if (_.has($scope.model.value, item.key)) {
                        $scope.model.value[item.key].enabled = item.enabled;
                        $scope.model.value[item.key].config = angular.copy(item.config);
                    } else {
                        $scope.model.value[item.key] = {
                            enabled: false,
                            config: angular.copy(item.config)
                        };
                    }

                    if (_.has($scope.model.value[item.key].config, "config")) {
                        $scope.model.value[item.key].config.config = model !== null
                            ? angular.copy(model)
                            : angular.copy(item.config.config);
                    }

                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };

            editorService.open(configureTool);

            setDirty();
        }

        function setDirty() {
            if ($scope.propertyForm) {
                $scope.propertyForm.$setDirty();
            }
        };

        init();
    }
]);

angular.module("umbraco").controller("Our.Umbraco.Editorjs.SettingsToolsConfigure.Controller", [
    "$scope",
    function ($scope) {

        //console.log("editorjs.overlay.model", $scope.model);

        var defaultConfig = {};
        var config = angular.extend({}, defaultConfig, $scope.model.config);

        var vm = this;

        function init() {
            vm.title = "Configure JSON";

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

            vm.close = close;
            vm.save = save;
        };

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        };

        function save(item) {
            var obj = item.length > 0
                ? JSON.parse(item)
                : null;

            if ($scope.model.submit) {
                $scope.model.submit(obj);
            }
        };

        init();
    }
]);
