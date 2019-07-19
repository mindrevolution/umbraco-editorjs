angular.module("umbraco").controller("Our.Umbraco.Editorjs.Controller", [
    "$scope",
    "assetsService",
    "editorService",
    "umbRequestHelper",
    function ($scope, assetsService, editorService, umbRequestHelper) {

        if (_.has($scope.model, "contentTypeId")) {
            // NOTE: This will prevents Editor.js attempting to load whilst in the Content Type Editor's property preview panel.
            return;
        }

        var _isGridEditor = $scope.control !== undefined;

        var defaultConfig = { tools: {} };
        var config = angular.extend({}, defaultConfig, (_isGridEditor ? $scope.control.editor.config : $scope.model.config));

        var vm = this;

        function init() {

            vm.editorjs = null;
            vm.layout = _isGridEditor || $scope.model.hideLabel ? "umb-editorjs-80" : "umb-editorjs-70";

            // set the Editor.js instance id
            vm.editorId = "editorjs_" + (_isGridEditor ? $scope.control.$uniqueId.substring(0, 8) : $scope.model.alias);
            //console.log("editorjs.init", vm.editorId, _isGridEditor, (_isGridEditor ? $scope.control : $scope.model));

            // load the separate css for the editor to avoid it blocking our JavaScript loading
            assetsService.loadCss("/App_Plugins/editorjs/backoffice.css");

            // - load blocks
            if (_.isEmpty(config.tools) === false) {
                var toolScripts = [],
                    toolsConfig = {};

                _.each(config.tools, function (tool) {
                    toolScripts.push(umbRequestHelper.convertVirtualToAbsolutePath(tool.path));
                });

                assetsService.load(toolScripts).then(function () {

                    // - configure the blocks - this can only be done AFTER the scripts are loaded.
                    _.each(config.tools, function (tool) {

                        toolsConfig[tool.key] = angular.copy(tool.config);

                        // HACK: Object references can't be serialized to JSON, we needed to make it a string, then find the global object.
                        if (typeof toolsConfig[tool.key].class === "string" && _.has(window, toolsConfig[tool.key].class)) {
                            toolsConfig[tool.key].class = window[toolsConfig[tool.key].class];
                        }

                        if (toolsConfig[tool.key].hasOwnProperty("requiresEditorService") && toolsConfig[tool.key].requiresEditorService === true) {
                            // TODO: It would be great to use DI to inject any AngularJs service/resource.
                            toolsConfig[tool.key].config.editorService = editorService;
                        }
                    });

                    // - done loading the blocks ... init editor!
                    initEditorJs(toolsConfig);
                });
            }

        };

        function initEditorJs(blocksConfig) {
            vm.editorjs = new EditorJS({
                holder: vm.editorId,
                onChange: () => {
                    getEditorData();
                },
                tools: blocksConfig,
                data: _isGridEditor ? $scope.control.value : $scope.model.value,
                // NOTE, only found out about `minHeight` from here:
                // https://github.com/codex-team/editor.js/pull/745/files#diff-e3bf20e89f6b22c16beb3e17fb3c8a60R154
                minHeight: 50
            });
        };

        async function getEditorData() {
            try {
                const outputData = await vm.editorjs.save();
                if (_isGridEditor) {
                    $scope.control.value = outputData;
                } else {
                    $scope.model.value = outputData;
                }
                //console.log("saving", outputData);
            } catch (error) {
                console.error("unable to fetch Editor.js data", error);
            }
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
