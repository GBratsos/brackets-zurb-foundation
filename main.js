/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 2, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
	"use strict";
	/*
	 * Simple extension that adds a "File > New Zurb Foundation 5 Document" menu item
	 * to insert a Zurb Foundation 5 Document HTML at cursor position
	 */
	var AppInit = brackets.getModule("utils/AppInit"),
		CommandManager = brackets.getModule("command/CommandManager"),
		EditorManager = brackets.getModule("editor/EditorManager"),
		Menus = brackets.getModule("command/Menus"),
		PreferencesManager = brackets.getModule("preferences/PreferencesManager");

	// The user's indentation settings
	var indentUnits = "";

	// jQuery version constant
	var JQUERY_VERSION = "1.11.1";


	/**
	 * @private
	 * Polyfill from http://stackoverflow.com/a/4550005
	 * @param str Text to be repeated.
	 * @param num Number of times text should be repeated.
	 * @return {string} repeated the number of times stated.
	 */
	function _repeatString(str, num) {
		return (new Array(num + 1)).join(str);
	}

	/**
	 * @private
	 * Get the current indentation settings for use in inserted code
	 * @return {string} User's current indentation settings
	 */
	function _getIndentSize() {
		// Check the current project's preference on tabs and
		// update the indentation settings for either tabs for spaces
		return (PreferencesManager.get("useTabChar", PreferencesManager.CURRENT_PROJECT) ?
			_repeatString("\u0009", PreferencesManager.get("tabSize")) :
			_repeatString("\u0020", PreferencesManager.get("spaceUnits")));
	}


	// Get user's indentation settings
	PreferencesManager.on("change", function (e, data) {
		data.ids.forEach(function (value, index) {
			// A relevant preference was changed, update our settings
			if (value === "useTabChar" || value === "tabSize" || value === "spaceUnits") {
				// Do NOT attempt to assign `indentUnits` directly to the function.
				// It will completely break otherwise.
				var tempVar = _getIndentSize();
				indentUnits = tempVar;
			}
		});
	});



	/**
	 * @private
	 * Get the latest stable Boostrap version using the GitHub API
	 */
	function _getLatestZurbFoundation() {
		// However, we define a fallback just in case...
		var fallbackVersion = "5.4.6";
		var result = new $.Deferred();

		// Perform an asynchronous request
		$.ajax({
			cache: false,
			dataType: "json",
			url: "https://api.github.com/repos/zurb/foundation/releases",
			success: function (data) {
				// Do not accept prereleases
				if (!data[0].prerelease) {
					result.resolve(data[0].tag_name.replace(/^v/, ""));
				}
			},
			error: function () {
				result.resolve(fallbackVersion);
			}
		});
		return result.promise();
	}


	/**
	 * @private
	 * Insert the selected elements into the document
	 */
	function _inserthtmltemplate() {

		var htmltemplate = "<!doctype html>\n<html class='no-js' lang='en'>\n\n<head>\nindent-size<meta charset='utf-8' />\n" +
			"indent-size<meta name='viewport' content='width=device-width, initial-scale=1.0' />\n" +
			"indent-size<title>Foundation boots-version | Welcome</title>\nindent-size\n" +
			"indent-size<link rel='stylesheet' href='http://cdn.foundation5.zurb.com/foundation.css' />\n" +
			"indent-size<script src='//cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js'></script>\n" +
			"</head>\n\n<body>\n" +
			"indent-size<div class='row'>\n" +
			"indent-sizeindent-size<div class='large-12 columns'>\n" +
			"indent-sizeindent-sizeindent-size<h1>Welcome to Foundation</h1>\n" +
			"indent-sizeindent-size</div>\n" +
			"indent-size</div>\n\n" +
			"indent-size<div class='row'>\n" +
			"indent-sizeindent-size<div class='large-12 columns'>\n" +
			"indent-sizeindent-sizeindent-size<div class='panel'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<h3>We&rsquo;re stoked you want to try Foundation!</h3>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<p>To get going, this file (index.html) includes some basic styles you can modify, play around with, or totally destroy to get going.</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<p>Once you've exhausted the fun in this document, you should check out:</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<div class='row'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-4 medium-4 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<p><a href='http://foundation.zurb.com/docs'>Foundation Documentation</a>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<br />Everything you need to know about using the framework.</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-4 medium-4 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<p><a href='http://github.com/zurb/foundation'>Foundation on Github</a>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<br />Latest code, issue reports, feature requests and more.</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-4 medium-4 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<p><a href='http://twitter.com/foundationzurb'>@foundationzurb</a>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<br />Ping us on Twitter if you have questions. If you build something with this we'd love to see it (and send you a totally boss sticker).</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-size</div>\n" +
			"indent-size</div>\n\n" +
			"indent-size<div class='row'>\n" +
			"indent-sizeindent-size<div class='large-8 medium-8 columns'>\n" +
			"indent-sizeindent-sizeindent-size<h5>Here&rsquo;s your basic grid:</h5>\n" +
			"indent-sizeindent-sizeindent-size<!-- Grid Example -->\n" +
			"indent-sizeindent-sizeindent-size<div class='row'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<div class='large-12 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='callout panel'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<p><strong>This is a twelve column section in a row.</strong> Each of these includes a div.panel element so you can see where the columns are - it's not required at all for the grid.</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-size<div class='row'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<div class='large-6 medium-6 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='callout panel'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<p>Six columns</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<div class='large-6 medium-6 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='callout panel'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<p>Six columns</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-size<div class='row'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<div class='large-4 medium-4 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='callout panel'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<p>Four columns</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<div class='large-4 medium-4 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='callout panel'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<p>Four columns</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<div class='large-4 medium-4 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='callout panel'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<p>Four columns</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-size<hr />\n" +
			"indent-sizeindent-sizeindent-size<h5>We bet you&rsquo;ll need a form somewhere:</h5>\n" +
			"indent-sizeindent-sizeindent-size<form>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<div class='row'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-12 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label>Input Label</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<input type='text' placeholder='large-12.columns' />\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<div class='row'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-4 medium-4 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label>Input Label</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<input type='text' placeholder='large-4.columns' />\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-4 medium-4 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label>Input Label</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<input type='text' placeholder='large-4.columns' />\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-4 medium-4 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='row collapse'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label>Input Label</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='small-9 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<input type='text' placeholder='small-9.columns' />\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='small-3 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<span class='postfix'>.com</span>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='row'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-12 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label>Select Box</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<select>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<option value='husker'>Husker</option>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<option value='starbuck'>Starbuck</option>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<option value='hotdog'>Hot Dog</option>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<option value='apollo'>Apollo</option>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size</select>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='row'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-6 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label>Choose Your Favorite</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<input type='radio' name='pokemon' value='Red' id='pokemonRed'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label for='pokemonRed'>Radio 1</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<input type='radio' name='pokemon' value='Blue' id='pokemonBlue'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label for='pokemonBlue'>Radio 2</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-6 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label>Check these out</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<input id='checkbox1' type='checkbox'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label for='checkbox1'>Checkbox 1</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<input id='checkbox2' type='checkbox'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label for='checkbox2'>Checkbox 2</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='row'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<div class='large-12 columns'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<label>Textarea Label</label>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size<textarea placeholder='small-12.columns'></textarea>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-sizeindent-size</form>\n" +
			"indent-sizeindent-size</div>\n" +
			"indent-sizeindent-size<div class='large-4 medium-4 columns'>\n" +
			"indent-sizeindent-sizeindent-size<h5>Try one of these buttons:</h5>\n" +
			"indent-sizeindent-sizeindent-size<p><a href='#' class='small button'>Simple Button</a>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<br/>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<a href='#' class='small radius button'>Radius Button</a>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<br/>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<a href='#' class='medium success button'>Success Btn</a>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<br/>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<a href='#' class='medium alert button'>Alert Btn</a>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<br/>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<a href='#' class='medium secondary button'>Secondary Btn</a>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<br/>\n" +
			"indent-sizeindent-sizeindent-size</p>\n" +
			"indent-sizeindent-sizeindent-size<div class='panel'>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<h5>So many components, girl!</h5>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<p>A whole kitchen sink of goodies comes with Foundation. Checkout the docs to see them all, along with details on making them your own.</p>\n" +
			"indent-sizeindent-sizeindent-sizeindent-size<a href='http://foundation.zurb.com/docs/' class='small button'>Go to Foundation Docs</a>\n" +
			"indent-sizeindent-sizeindent-size</div>\n" +
			"indent-sizeindent-size</div>\n" +
			"indent-size</div>\n\n" +
			"indent-size <script src='//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>\n" +
			"indent-size<script src='http://cdn.foundation5.zurb.com/foundation.js'></script>\n" +
			"indent-size<script>\n" +
			"indent-sizeindent-size$(document).foundation();\n" +
			"indent-size</script>\n" +
			"</body>\n\n</html>\n";

		// Since fetching the lastest version is an async process,
		// the rest of the actions need to be too
		_getLatestZurbFoundation().then(function (version) {
			var editor = EditorManager.getCurrentFullEditor();
			if (editor) {
				// Insert the skeleton at the current cursor position
				var insertionPos = editor.getCursorPos();
				editor.document.batchOperation(function () {
					// Do a regex search for asset version keywords
					// and replace them with the appropriate version number,
					// as well as for the `indent-size` keyword with indentation settings
					// Also replace all single quotes with double quotes
					htmltemplate = htmltemplate.replace(/boots-version/g, version)
						.replace(/jq-version/g, JQUERY_VERSION)
						.replace(/indent-size/g, indentUnits)
						.replace(/'/g, "\"");
					editor.document.replaceRange(htmltemplate, insertionPos);
				});
			}
		});
	}


	/**
	 * @private
	 * Load the extension after Brackets itself has finished loading.
	 */
	AppInit.appReady(function () {
		var EXTENSION_ID = "gbratsos.zurb-foundation";
		CommandManager.register("New Zurb Foundation 5 Document", EXTENSION_ID, _inserthtmltemplate);
		var theMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
		theMenu.addMenuItem(EXTENSION_ID);
	});
});
