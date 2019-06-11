{
    "Inline Tools": [
        {
            "key": "inlineCode",
            "name": "Inline code",
            "description": "Inline Tool for marking code-fragments for the Editor.js.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/inline-code.js",
            "config": {
                "class": "InlineCode",
            }
        },
        {
            "key": "Marker",
            "name": "Marker",
            "description": "Marker Tool for highlighting text-fragments for the Editor.js.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/marker.js",
            "config": {
                "class": "Marker"
            }
        }
    ],
    "Block Tools": [
        {
            "key": "checklist",
            "name": "Checklist",
            "description": "This Tool for the Editor.js allows you to add checklists to your texts.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/checklist.js",
            "config": {
                "class": "Checklist",
                "inlineToolbar": true,
            }
        },
        {
            "key": "code",
            "name": "Code",
            "description": "Code Tool for the Editor.js allows to include code examples in your articles.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/code.js",
            "config": {
                "class": "CodeTool"
            }
        },
        {
            "key": "delimiter",
            "name": "Delimiter",
            "description": "Delimiter Tool for the Editor.js.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/delimiter.js",
            "config": {
                "class": "Delimiter"
            }
        },
        {
            "key": "embed",
            "name": "Embed",
            "description": "Provides Block tool for embedded content for the Editor.js. Tool uses Editor.js pasted patterns handling and inserts iframe with embedded content.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/embed.js",
            "config": {
                "class": "Embed",
                "inlineToolbar": true
            }
        },
        {
            "key": "header",
            "name": "Header",
            "description": "Provides Headings Blocks for the Editor.js.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/header.js",
            "config": {
                "class": "Header",
                "inlineToolbar": true,
                "config": {
                    "placeholder": "Enter a header"
                }
            }
        },
        {
            "key": "linkTool",
            "name": "Link",
            "description": "Link Block for the Editor.js.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/link.js",
            "config": {
                "class": "LinkTool",
                "config": {
                    "endpoint": '/umbraco/backoffice/EditorJs/LinkTool/FetchUrl', // Your backend endpoint for url data fetching
                }
            }
        },
        {
            "key": "list",
            "name": "List",
            "description": "This Tool for the Editor.js allows you to add ordered or unordered (bulleted) lists to your article.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/list.js",
            "config": {
                "class": "List",
                "inlineToolbar": true,
            }
        },
        {
            "key": "quote",
            "name": "Quote",
            "description": "Provides Quote Blocks for the Editor.js.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/quote.js",
            "config": {
                "class": "Quote",
                "inlineToolbar": true,
                //shortcut: 'CMD+SHIFT+O',
                "config": {
                    "quotePlaceholder": "Enter a quote",
                    "captionPlaceholder": "Quote's author",
                }
            }
        },
        {
            "key": "raw",
            "name": "Raw HTML",
            "description": "Raw Tool for the Editor.js allows to include raw HTML code in your articles.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/rawHtml.js",
            "config": {
                "class": "RawTool"
            }
        },
        {
            "key": "table",
            "name": "Table",
            "description": "Table Block for the Editor.js.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/table.js",
            "config": {
                "class": "Table",
                "inlineToolbar": true,
                "config": {
                    "rows": 3,
                    "cols": 3,
                },
            }
        },
        {
            "key": "image",
            "name": "Umbraco Media",
            "description": "Umbraco Media (Image) Block for the Editor.js.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/umbracoMedia.js",
            "config": {
                "class": "UmbracoMedia",
                "config": {
                    "endpoints": {
                        "byFile": "/umbraco/backoffice/EditorJs/ImageTool/UploadByFile",
                        "byUrl": "/umbraco/backoffice/EditorJs/ImageTool/UploadByUrl"
                    },
                    "mediapicker": "openMediaPicker",
                    "afterUpload": "setMediaFolder"
                }
            }
        },
        {
            "key": "warning",
            "name": "Warning",
            "description": "Provides Warning Block, with a title and message. It can be used, for example, for editorials notifications or appeals.",
            "path": "~/App_Plugins/Editorjs/Lib/blocks/warning.js",
            "config": {
                "class": "Warning",
                "inlineToolbar": true,
                //shortcut: 'CTRL+SHIFT+W',
                "config": {
                    "titlePlaceholder": "Title",
                    "messagePlaceholder": "Message",
                },
            }
        }
    ]
}
