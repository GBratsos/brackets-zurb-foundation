define(function (require, exports, module) {
	"use strict";

	var docIndex = 1,
	    commandId = "new-zurbfoundation-page",
	    menuID = "zf.menuID",
	    menuLabel = "New Zurb Foundation Document",
		DocumentManager = brackets.getModule("document/DocumentManager"),
		Commands = brackets.getModule("command/Commands"),
		CommandManager = brackets.getModule("command/CommandManager"),
		KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
		EditorManager = brackets.getModule("editor/EditorManager"),
		MainViewManager = brackets.getModule("view/MainViewManager"),
		Menus = brackets.getModule("command/Menus"),
		bootstrapTemplate = require("text!template/basic.html"),
		sidebar = $("#sidebar"),
		toolbar = $("#main-toolbar"),
		menu;


	function templateHandle(templateContent) {
		try {
			var activeEditor = EditorManager.getActiveEditor();
			activeEditor.document.replaceRange(templateContent, activeEditor.getCursorPos());
		} catch (err) {}
	}

	function newFileHandle() {
		var defaultExtension = ".html",
		    doc = DocumentManager.createUntitledDocument(docIndex++, defaultExtension);

		MainViewManager._edit(MainViewManager.ACTIVE_PANE, doc);
		templateHandle(bootstrapTemplate);
		return new $.Deferred().resolve(doc).promise();
	}

	sidebar.on('dblclick', 'div', function (e) {
		if (e.target === this) {
			newFileHandle();
		}
	});

	toolbar.on('dblclick', function (e) {
		if (e.target === this) {
			newFileHandle();
		}
	});

	CommandManager.register(menuLabel, menuID, newFileHandle);
	menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
	menu.addMenuItem(menuID, undefined, Menus.AFTER, Commands.FILE_NEW_UNTITLED);
    KeyBindingManager.addBinding(menuID, "Ctrl-Alt-Z", "mac");
	KeyBindingManager.addBinding(menuID, "Ctrl-Alt-Z", "win");
});
