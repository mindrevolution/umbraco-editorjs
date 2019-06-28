angular.module("umbraco").controller("Our.Umbraco.Editorjs.Controller", [
    "$scope",
    "assetsService",
    "editorService",
    "umbRequestHelper",
    "Our.Umbraco.Editorjs.Resources.ImageTool",
    function ($scope, assetsService, editorService, umbRequestHelper, editorjsImageToolResource) {

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

                        // HACK: Edge-case, as the UmbracoMedia tool references functions from within this controller.
                        if (tool.key === "image") {
                            // NOTE: These function references had to be serialized as strings.
                            // TODO: [LK:2019-06-12] We'll need to figure out how to deal with these scenarios.
                            toolsConfig[tool.key].config.mediapicker = openMediaPicker;
                            toolsConfig[tool.key].config.afterUpload = setMediaFolder;
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

        function openMediaPicker(e) {
            //console.log("openMediaPicker:", e);
            var block = e;

            var options = {
                multiPicker: false,
                onlyImages: true,
                disableFolderSelect: true,
                submit: function (result) {
                    editorService.close();
                    var media = result.selection[0];
                    block.image = {
                        url: media.file.src + "?width=1000&mode=max&format=jpeg&quality=90",
                        udi: media.udi
                    };
                },
                close: function () {
                    editorService.close();
                }
            };

            editorService.mediaPicker(options);
        };

        function setMediaFolder(udi) {
            //console.log("setMediaFolder", udi);

            var mediaUdi = udi;

            var options = {
                multiPicker: false,
                onlyImages: false,
                disableFolderSelect: false,
                title: "Sort media into folder?",
                submit: function (result) {
                    editorService.close();
                    var folder = result.selection[0];
                    if (folder !== null) {
                        // - move media to this folder!
                        var folderUdi = folder.udi;
                        //console.log("MOVE MEDIA", mediaUdi, folderUdi, folder);

                        editorjsImageToolResource.moveMedia(mediaUdi, folderUdi)
                            .then(function () {
                                //console.log("media moved", mediaUdi, folder, folderUdi);
                            }, function (err) {
                                console.error("unable to move media:" + err.data.Message, mediaUdi, folder, folderUdi);
                            });
                    }
                },
                close: function () {
                    editorService.close();
                }
            };

            editorService.mediaPicker(options);
        };

        function setDirty() {
            if ($scope.propertyForm) {
                $scope.propertyForm.$setDirty();
            }
        };

        init();
    }
]);

angular.module("umbraco.resources").factory("Our.Umbraco.Editorjs.Resources.ImageTool", [
    "$q",
    "$http",
    function ($q, $http) {
        return {
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
    }
]);
