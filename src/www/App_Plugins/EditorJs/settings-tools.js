angular.module("umbraco").controller("Our.Umbraco.Editorjs.SettingsTools.Controller", [
    "$scope",
    "editorService",
    function ($scope, editorService) {

        //console.log("editorjs.model", $scope.model);

        var defaultConfig = { items: {} };
        var config = angular.extend({}, defaultConfig, $scope.model.config);

        var vm = this;

        function init() {
            $scope.model.value = $scope.model.value || config.items;

            if (_.isArray($scope.model.value) === false) {
                $scope.model.value = config.items;
            }

            vm.icon = "icon-settings-alt";
            vm.allowAdd = true;
            vm.allowEdit = true;
            vm.allowRemove = true;
            vm.published = true;
            vm.sortable = true;

            vm.sortableOptions = {
                axis: "y",
                containment: "parent",
                cursor: "move",
                disabled: vm.sortable === false,
                opacity: 0.7,
                scroll: true,
                tolerance: "pointer",
                stop: function (e, ui) {
                    setDirty();
                }
            };

            vm.add = add;
            vm.edit = edit;
            vm.remove = remove;
        };

        function add($event) {
            editorService.open({
                view: "/App_Plugins/EditorJs/settings-tools-overlay.html",
                size: "small",
                config: {
                    mode: "select",
                    items: _.reject(config.items, function (x) {
                        return _.find($scope.model.value, function (y) { return x.key === y.key; });
                    }),
                },
                value: {},
                submit: function (model) {
                    $scope.model.value.push(model);
                    setDirty();
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            });
        };

        function edit($index, item) {
            editorService.open({
                view: "/App_Plugins/EditorJs/settings-tools-overlay.html",
                size: "small",
                config: {
                    mode: "configure",
                },
                value: angular.copy($scope.model.value[$index]),
                submit: function (model) {
                    $scope.model.value[$index] = model;
                    setDirty();
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            });
        };

        function remove($index) {
            $scope.model.value.splice($index, 1);
            setDirty();
        };

        function setDirty() {
            if ($scope.propertyForm) {
                $scope.propertyForm.$setDirty();
            }
        };

        init();
    }
]);
