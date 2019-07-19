[
    {
        "key": "header",
        "icon": "icon-coin",
        "name": "Header",
        "description": "Header Tool allows you to add headings, from H1 to H6.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/header.js",
        "config": {
            "class": "Header",
            "inlineToolbar": true,
            "config": {
                "placeholder": "Enter a header"
            }
        }
    },
    {
        "key": "image",
        "icon": "icon-picture",
        "name": "Image",
        "description": "Image Tool allows you to insert media from Umbraco.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/umbracoMedia.js",
        "config": {
            "class": "UmbracoMedia",
            "requiresEditorService": true,
            "config": {
                "endpoints": {
                    "byFile": "/umbraco/backoffice/EditorJs/ImageTool/UploadByFile",
                    "byUrl": "/umbraco/backoffice/EditorJs/ImageTool/UploadByUrl",
                    "moveMedia": "/umbraco/backoffice/EditorJs/ImageTool/MoveMedia"
                }
            }
        }
    },
    {
        "key": "list",
        "icon": "icon-ordered-list",
        "name": "List",
        "description": "List Tool allows you to add numeric or bulleted lists.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/list.js",
        "config": {
            "class": "List",
            "inlineToolbar": true,
        }
    },
    {
        "key": "linkTool",
        "icon": "icon-link",
        "name": "Link",
        "description": "Link Tool allows you to insert a link block.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/link.js",
        "config": {
            "class": "LinkTool",
            "config": {
                "endpoint": '/umbraco/backoffice/EditorJs/LinkTool/FetchUrl', // Your backend endpoint for url data fetching
            }
        }
    },
    {
        "key": "code",
        "icon": "icon-brackets",
        "name": "Code",
        "description": "Code Tool allows you to add code snippets to your articles.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/code.js",
        "config": {
            "class": "CodeTool"
        }
    },
    {
        "key": "quote",
        "icon": "icon-quote",
        "name": "Quote",
        "description": "Quote Tool allows you to insert blockquotes.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/quote.js",
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
        "key": "delimiter",
        "icon": "icon-navigation-horizontal",
        "name": "Delimiter",
        "description": "Delimiter Tool allows you insert a horizontal break.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/delimiter.js",
        "config": {
            "class": "Delimiter"
        }
    },
    {
        "key": "embed",
        "icon": "icon-window-popin",
        "name": "Embed",
        "description": "Embed Tool allows you to insert embedded content.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/embed.js",
        "config": {
            "class": "Embed",
            "inlineToolbar": true
        }
    },
    {
        "key": "checklist",
        "icon": "icon-checkbox",
        "name": "Checklist",
        "description": "Checklist Tool allows you to add checklists to your texts.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/checklist.js",
        "config": {
            "class": "Checklist",
            "inlineToolbar": true,
        }
    },
    {
        "key": "table",
        "icon": "icon-grid",
        "name": "Table",
        "description": "Table Tool allows you to insert tabular data.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/table.js",
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
        "key": "warning",
        "icon": "icon-alert-alt",
        "name": "Warning",
        "description": "Warning Tool allows you to add editorial noticiations/appeals.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/warning.js",
        "config": {
            "class": "Warning",
            "inlineToolbar": true,
            //shortcut: 'CTRL+SHIFT+W',
            "config": {
                "titlePlaceholder": "Title",
                "messagePlaceholder": "Message",
            },
        }
    },
    {
        "key": "raw",
        "icon": "icon-code",
        "name": "Raw HTML",
        "description": "Raw Tool allows you to insert HTML code in your articles.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/rawHtml.js",
        "config": {
            "class": "RawTool"
        }
    },
    {
        "key": "Marker",
        "icon": "icon-brush",
        "name": "Marker",
        "description": "Marker Tool for highlighting text-fragments.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/marker.js",
        "config": {
            "class": "Marker"
        }
    },
    {
        "key": "inlineCode",
        "icon": "icon-brackets",
        "name": "Inline code",
        "description": "Inline Tool for marking code-fragments.",
        "path": "~/App_Plugins/EditorJs/lib/blocks/inline-code.js",
        "config": {
            "class": "InlineCode",
        }
    }
]
