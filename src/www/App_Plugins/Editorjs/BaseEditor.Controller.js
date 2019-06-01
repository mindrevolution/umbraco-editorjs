angular.module("umbraco")
    .controller("Editorjs.BaseEditor.Controller", ["$scope", "assetsService", "editorService", "$routeParams", "editorjsSettingsResource",
	function ($scope, assetsService, editorService, $routeParams, editorjsSettingsResource) {

        console.log("init editorjs", $scope.control, $scope.model);

        $scope.isGridEditor = $scope.control !== undefined;
        $scope.isPropertyEditor = !$scope.isGridEditor;

        // - build the instance id
        $scope.instanceId = "editorjs_";
        if ($scope.isGridEditor) {
            $scope.instanceId += $scope.control.$uniqueId;
        } else {
            $scope.instanceId += $scope.$id;
        }

        console.info("editorjs #" + $scope.instanceId, "$scope.isGridEditor", $scope.isGridEditor, "$scope.isPropertyEditor", $scope.isPropertyEditor);

        $scope.blocks = [];

        $scope.init = function () {
            // initialize editorjs
            $scope.editorjs = new EditorJS({
                // build this instance's id
                holder: $scope.instanceId,
                onChange: () => {
                    $scope.fetchEditorData();
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
                                byUrl: 'http://localhost:8008/fetchUrl', // Your endpoint that provides uploading by Url
                            },
                            mediapicker: $scope.openMediaPicker
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
                        // config: {
                        //   rows: 2,
                        //   cols: 3,
                        // },
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

                /**
                 * Previously saved data that should be rendered
                 */
                data: $scope.isGridEditor ? $scope.control.value : $scope.model.value
            });

            //console.log("$scope.editorjs", $scope.editorjs);

            // $scope.$on("formSubmitting", function(e, args) {
            //     //console.log("formSubmitting", e, args, $scope.control.value);
            //     try {
            //         //const editordata = await $scope.editorjs.save();
            //         const editordata = $scope.getEditorData();
            //         $scope.control.value = editordata;
            //         console.log("$scope.editorjs.save()", editordata);
            //     } catch (error) {
            //         console.log(error);
            //     }
            // });
        },

        $scope.fetchEditorData = async function (){
            try {
                const editordata = await $scope.editorjs.save();
                if ($scope.isGridEditor) {
                    $scope.control.value = editordata;
                } else {
                    $scope.model.value = editordata;
                }

                //console.log("$scope.editorjs.save()", editordata);
            } catch (error) {
                console.error("unable to fetch Editor.js data", error);
            }
        },

        $scope.openMediaPicker = function (e) {
            console.log("$scope.openMediaPicker:", e);
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
        },

        $scope.setMediaFolder = function () {
            var options = {
                view: "views/common/infiniteeditors/treepicker/treepicker.html",
                size: "small",
                section: "media",
                treeAlias: "media",
                multiPicker: false,
                submit: function (result) {
                    console.log("setMediaFolder:submit", result);
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.contentPicker(options);
        },

        // load the separate css for the editor to avoid it blocking our JavaScript loading
        assetsService.loadCss("/App_Plugins/editorjs/backoffice.css");

        // - load blocks
        editorjsSettingsResource.getGridEditorBlocksConfiguration().then(function (response) {
            var cfg = {
                blocks: response.data
            };

            // - existing assigments? Apply them (selected: true/false?)
            if (cfg.blocks !== null && cfg.blocks.length > 0) {
                angular.forEach(cfg.blocks, function (block, index) {
                    // active?!!? TODO! ****************************************************************************************************
                    $scope.blocks.push("/App_Plugins/editorjs/Lib/blocks/" + block.Filename);
                });
            }

            // - load blocks
            assetsService.load($scope.blocks).then(function(){
                //console.log("$scope.blocks loaded", $scope.blocks);

                // - done loading the blocks ... init editor!
                $scope.init();
            });
        });

    }]);