angular.module("umbraco").controller("Our.Umbraco.Editorjs.Controller", [
    "$scope",
    "assetsService",
    "editorService",
    "Our.Umbraco.Editorjs.Resources.ImageTool",
    function ($scope, assetsService, editorService, editorjsImageToolResource) {

        var defaultConfig = { blocks: [] };
        var config = angular.extend({}, defaultConfig, $scope.model.config);

        var vm = this;

        vm.layout = $scope.model.hideLabel ? "umb-editorjs-80" : "umb-editorjs-70";
        vm.isGridEditor = $scope.control !== undefined;

        // set the Editor.js instance id
        vm.editorId = "editorjs_" + (vm.isGridEditor ? $scope.control.$uniqueId : $scope.model.alias);
        console.log("editorjs.init", vm.editorId, vm.isGridEditor, ($scope.model || $scope.control));

        vm.editorjs = null;

        function init() {

            // initialize editorjs
            vm.editorjs = new EditorJS({
                // build this instance's id
                holder: vm.editorId,
                onChange: () => {
                    fetchEditorData();
                },
                tools: {
                    header: {
                        class: Header,
                        inlineToolbar: true,
                        config: {
                            //placeholder: 'Enter a header'
                        }
                    },

                    image: {
                        class: UmbracoMedia,
                        config: {
                            endpoints: {
                                byFile: "/umbraco/backoffice/editorJs/ImageTool/UploadByFile",
                                byUrl: "/umbraco/backoffice/editorJs/ImageTool/UploadByUrl"
                            },
                            mediapicker: openMediaPicker,
                            afterUpload: setMediaFolder
                        }
                    },

                    quote: {
                        class: Quote,
                        inlineToolbar: true,
                        //shortcut: 'CMD+SHIFT+O',
                        config: {
                            quotePlaceholder: 'Enter a quote',
                            captionPlaceholder: 'Quote\'s author',
                        }
                    },

                    Marker: {
                        class: Marker
                    },

                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: 'http://localhost:8008/fetchUrl', // Your backend endpoint for url data fetching
                        }
                    },

                    embed: {
                        class: Embed,
                        inlineToolbar: true
                    },

                    list: {
                        class: List,
                        inlineToolbar: true,
                    },

                    table: {
                        class: Table,
                        inlineToolbar: true,
                        config: {
                            rows: 2,
                            cols: 3,
                        },
                    },

                    warning: {
                        class: Warning,
                        inlineToolbar: true,
                        //shortcut: 'CTRL+SHIFT+W',
                        config: {
                            titlePlaceholder: 'Title',
                            messagePlaceholder: 'Message',
                        },
                    },

                    checklist: {
                        class: Checklist,
                        inlineToolbar: true,
                    },

                    inlineCode: {
                        class: InlineCode,
                    },

                    code: CodeTool,

                    delimiter: Delimiter,

                    raw: RawTool,
                },

                // Previously saved data that should be rendered
                data: vm.isGridEditor ? $scope.control.value : $scope.model.value
            });

            //console.log("editorjs", vm.editorjs);

            // $scope.$on("formSubmitting", function(e, args) {
            //     //console.log("formSubmitting", e, args, $scope.control.value);
            //     try {
            //         //const editordata = await vm.editorjs.save();
            //         const editordata = $scope.getEditorData();
            //         $scope.control.value = editordata;
            //         console.log("vm.editorjs.save()", editordata);
            //     } catch (error) {
            //         console.log(error);
            //     }
            // });
        };

        async function fetchEditorData() {
            try {
                const editordata = await vm.editorjs.save();
                if (vm.isGridEditor) {
                    $scope.control.value = editordata;
                } else {
                    $scope.model.value = editordata;
                }
                //console.log("vm.editorjs.save()", editordata);
            } catch (error) {
                console.error("unable to fetch Editor.js data", error);
            }
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

        // load the separate css for the editor to avoid it blocking our JavaScript loading
        assetsService.loadCss("/App_Plugins/editorjs/backoffice.css");

        // - load blocks
        if (config.blocks.length > 0) {
            var blocksToLoad = [];

            _.each(config.blocks, function (block) {
                blocksToLoad.push("/App_Plugins/editorjs/Lib/blocks/" + block);
            });

            assetsService.load(blocksToLoad).then(function () {
                // - done loading the blocks ... init editor!
                init();
            });
        }

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
