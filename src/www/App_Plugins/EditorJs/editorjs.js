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
                    console.log("initEditorJs, toolsConfig", toolsConfig);
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

            vm.editorjs.isReady
                .then(() => {
                    // - this is ridiculous ... but seems to be working for now.
                    // - need to come up with a more viable solution without so many flaws (closed on lost focus and such)
                    var iltActions = $("#" + vm.editorId).find(".ce-inline-toolbar__actions");

                    var urlHijackButton = $('<button type="button" class="ce-inline-tool ce-inline-tool--umbracolinkpicker"><svg height="20px" width="20px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m497 241h-46v-45c0-8.289062-6.710938-15-15-15h-137.761719c-4.535156-12.707031-14.53125-22.703125-27.238281-27.238281v-32.761719h45c8.289062 0 15-6.710938 15-15v-91c0-8.289062-6.710938-15-15-15h-120c-8.289062 0-15 6.710938-15 15v91c0 8.289062 6.710938 15 15 15h45v32.761719c-12.707031 4.535156-22.703125 14.53125-27.238281 27.238281h-137.761719c-8.289062 0-15 6.710938-15 15v45h-46c-8.289062 0-15 6.710938-15 15v90c0 8.289062 6.710938 15 15 15h121c8.289062 0 15-6.710938 15-15v-15h90v31.519531c-34.191406 6.96875-60 37.265625-60 73.480469 0 41.351562 33.648438 76 75 76s75-34.648438 75-76c0-36.214844-25.808594-66.511719-60-73.480469v-31.519531h90v15c0 8.289062 6.710938 15 15 15h121c8.289062 0 15-6.710938 15-15v-90c0-8.289062-6.710938-15-15-15zm-346 60v-45c0-8.289062-6.710938-15-15-15h-45v-30h122.761719c6.214843 17.421875 22.707031 30 42.238281 30s36.023438-12.578125 42.238281-30h122.761719v30h-45c-8.289062 0-15 6.710938-15 15v45zm0 0"/></svg></button>');
                    urlHijackButton.on("click", function (e) {
                        var target = $(e.target).closest("button");
                        pickUmbracoLink(target);
                    });
                    iltActions.append(urlHijackButton);
                })
                .catch((reason) => {
                    console.error("Attaching Umbraco to the Editor.js inline link tool failed: " + reason, reason);
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

        function pickUmbracoLink(target) {
            var umblink;
            var etarget = target;

            editorService.contentPicker({
                multiPicker: false,
                submit: function (result) {
                    editorService.close();
                    umblink = result.selection[0]; // for contentPicker
                    //umblink = result.target; // for linkPicker, focus problems for now
                    //console.log("umblink.udi", result, umblink.udi);
                    setUmbracoLink(umblink.udi, etarget);
                },
                close: function () {
                    editorService.close();
                }
            });
        };

        function setUmbracoLink(link, target) {
            //console.log("setUmbracoLink", link, target);

            const ENTER_KEY = 13;
            var btn = $(target);
            var urlBox = btn.parent().find(".ce-inline-tool-input[placeholder='Add a link']");

            urlBox.val(link);
            urlBox.change();
            urlBox[0].dispatchEvent(new KeyboardEvent("keydown", { "keyCode": ENTER_KEY }));
        };

        init();
    }
]);
