angular.module("umbraco").controller("Our.Umbraco.Editorjs.Controller", [
    "$scope",
    "assetsService",
    "editorService",
    "umbRequestHelper",
    "Our.Umbraco.Editorjs.Resources.ImageTool",
    function ($scope, assetsService, editorService, umbRequestHelper, editorjsImageToolResource) {

        var defaultConfig = { tools: {} };
        var config = angular.extend({}, defaultConfig, $scope.model.config);

        var vm = this;

        function init() {

            vm.editorjs = null;
            vm.layout = $scope.model.hideLabel ? "umb-editorjs-80" : "umb-editorjs-70";
            vm.isGridEditor = $scope.control !== undefined;

            // set the Editor.js instance id
            vm.editorId = "editorjs_" + (vm.isGridEditor ? $scope.control.$uniqueId : $scope.model.alias);
            console.log("editorjs.init", vm.editorId, vm.isGridEditor, ($scope.model || $scope.control));

            // load the separate css for the editor to avoid it blocking our JavaScript loading
            assetsService.loadCss("/App_Plugins/editorjs/backoffice.css");

            // - load blocks
            if (_.isEmpty(config.tools) === false) {
                var toolScripts = [],
                    toolsConfig = {};

                _.each(config.tools, function (tool) {
                    if (tool.enabled) {
                        toolScripts.push(umbRequestHelper.convertVirtualToAbsolutePath(tool.path));
                    }
                });

                assetsService.load(toolScripts).then(function () {

                    // - configure the blocks - this can only be done AFTER the scripts are loaded.
                    for (var tool in config.tools) {

                        if (config.tools[tool].enabled === false) {
                            continue;
                        }

                        toolsConfig[tool] = angular.copy(config.tools[tool].config);

                        if (typeof toolsConfig[tool].class === "string" && _.has(window, toolsConfig[tool].class)) {
                            toolsConfig[tool].class = window[toolsConfig[tool].class];
                        }

                        if (tool === "image") {
                            // NOTE: There are other functions that I had to stringify ::facepalm::
                            // I'll need to figure out how to deal with this properly. [LK]
                            toolsConfig[tool].config.mediapicker = openMediaPicker;
                            toolsConfig[tool].config.afterUpload = setMediaFolder;
                        }
                    }

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
                data: vm.isGridEditor ? $scope.control.value : $scope.model.value
            });
        };

        async function getEditorData() {
            try {
                const outputData = await vm.editorjs.save();
                if (vm.isGridEditor) {
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
            console.log("setMediaFolder", udi);

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
                        console.log("MOVE MEDIA", mediaUdi, folderUdi, folder);

                        editorjsImageToolResource.moveMedia(mediaUdi, folderUdi)
                            .then(function () {
                                console.log("media moved", mediaUdi, folder, folderUdi);
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
