/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => LinkRange
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// node_modules/monkey-around/mjs/index.js
function around(obj, factories) {
  const removers = Object.keys(factories).map((key) => around1(obj, key, factories[key]));
  return removers.length === 1 ? removers[0] : function() {
    removers.forEach((r) => r());
  };
}
function around1(obj, method, createWrapper) {
  const original = obj[method], hadOwn = obj.hasOwnProperty(method);
  let current = createWrapper(original);
  if (original)
    Object.setPrototypeOf(current, original);
  Object.setPrototypeOf(wrapper, current);
  obj[method] = wrapper;
  return remove;
  function wrapper(...args) {
    if (current === original && obj[method] === wrapper)
      remove();
    return current.apply(this, args);
  }
  function remove() {
    if (obj[method] === wrapper) {
      if (hadOwn)
        obj[method] = original;
      else
        delete obj[method];
    }
    if (current === original)
      return;
    current = original;
    Object.setPrototypeOf(wrapper, original || Function);
  }
}

// main.ts
var import_view2 = require("@codemirror/view");

// src/settings.ts
var import_obsidian = require("obsidian");

// src/utils.ts
var NOTE_PLACEHOLDER = "$note";
var H1_PLACEHOLDER = "$h1";
var H2_PLACEHOLDER = "$h2";
function checkLinkText(href, settings) {
  const linkRegex = /([^#|]*)#?([^#|]*)?\|?(.*)?/;
  const matches = linkRegex.exec(href);
  if (matches == null || (matches == null ? void 0 : matches.length) < 3 || matches[2] == void 0) {
    return null;
  }
  const header = matches[2];
  const split = header.split(settings.headingSeparator);
  if (split.length < 2) {
    return null;
  }
  const note = matches[1];
  const h1 = split[0];
  const h2 = split[1];
  let altText = void 0;
  if ((matches == null ? void 0 : matches.length) > 3 && matches[3] != void 0) {
    altText = matches[3];
  } else {
    altText = settings.altFormat.replace(NOTE_PLACEHOLDER, note);
    altText = altText.replace(H1_PLACEHOLDER, h1);
    altText = altText.replace(H2_PLACEHOLDER, h2);
  }
  return { note, h1, h2, altText };
}
function checkLink(app, linkHTML, settings, isEmbed = false, hrefField = "data-href") {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const href = linkHTML.getAttribute(hrefField);
  if (href == null) {
    return null;
  }
  const res = checkLinkText(href, settings);
  const alt = linkHTML.getAttribute("alt");
  if (res && app.metadataCache != null) {
    if (alt != null && !alt.contains(res.note)) {
      res.altText = alt;
    }
    if (!isEmbed && !linkHTML.innerText.contains(res.note)) {
      res.altText = linkHTML.innerText;
    }
    const foundNote = app.vault.getMarkdownFiles().filter(
      (x) => x.basename == res.note
    ).first();
    if (foundNote) {
      const meta = app.metadataCache.getFileCache(foundNote);
      if (meta == void 0 || (meta == null ? void 0 : meta.headings) == void 0) {
        return null;
      }
      const h1Line = (_b = (_a = meta == null ? void 0 : meta.headings) == null ? void 0 : _a.filter(
        (h) => h.heading == res.h1
      ).first()) == null ? void 0 : _b.position.start.line;
      let h2Line = null;
      if (settings.endInclusive) {
        let h2LineIndex = (_c = meta == null ? void 0 : meta.headings) == null ? void 0 : _c.findIndex(
          (h) => h.heading == res.h2
        );
        if (((_d = meta == null ? void 0 : meta.headings) == null ? void 0 : _d.length) > h2LineIndex) {
          h2LineIndex += 1;
        }
        h2Line = (_f = (_e = meta == null ? void 0 : meta.headings) == null ? void 0 : _e.at(h2LineIndex)) == null ? void 0 : _f.position.end.line;
      } else {
        h2Line = (_h = (_g = meta == null ? void 0 : meta.headings) == null ? void 0 : _g.filter(
          (h) => h.heading == res.h2
        ).first()) == null ? void 0 : _h.position.end.line;
      }
      if (h1Line == void 0) {
        return null;
      }
      res.h1Line = h1Line;
      res.h2Line = h2Line;
      return res;
    }
  }
  return null;
}
function postProcessorUpdate(app) {
  for (const leaf of app.workspace.getLeavesOfType("markdown")) {
    const view = leaf.view;
    view.previewMode.renderer.clear();
    view.previewMode.renderer.set(view.editor.cm.state.doc.toString());
  }
  app.workspace.updateOptions();
}

// src/settings.ts
var DEFAULT_SETTINGS = {
  headingSeparator: "..",
  altFormat: "$note:$h1-$h2",
  endInclusive: true
};
var LinkRangeSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Settings for link-range plugin" });
    new import_obsidian.Setting(containerEl).setName("Heading Separator").setDesc('Defines the separator to be used to define a link heading range. Defaults to ".." (i.e. [[Note Name#h1..h2]])').addText((text) => text.setPlaceholder("Enter a separator string (defaults to ..)").setValue(this.plugin.settings.headingSeparator).onChange(async (value) => {
      this.plugin.settings.headingSeparator = value;
      await this.plugin.saveSettings();
      postProcessorUpdate(this.app);
    }));
    new import_obsidian.Setting(containerEl).setName("Alt Text Format").setDesc("Defines the alternate text format that gets shown in read mode. Use $note for the note placeholder and $h1/$h2 for the header placeholders").addText((text) => text.setPlaceholder("Enter an alt format").setValue(this.plugin.settings.altFormat).onChange(async (value) => {
      this.plugin.settings.altFormat = value;
      await this.plugin.saveSettings();
      postProcessorUpdate(this.app);
    }));
    new import_obsidian.Setting(containerEl).setName("End Inclusive").setDesc("Whether or not the end heading should be inclusive or exclusive").addToggle((bool) => bool.setValue(this.plugin.settings.endInclusive).onChange(async (value) => {
      this.plugin.settings.endInclusive = value;
      await this.plugin.saveSettings();
      postProcessorUpdate(this.app);
    }));
  }
};

// src/embeds.ts
var import_obsidian2 = require("obsidian");
async function replaceEmbed(app, embed, settings, isMarkdownPost = false) {
  let embedHtml = embed;
  const res = checkLink(app, embedHtml, settings, true, "src");
  if (res !== null) {
    const { vault } = app;
    const foundNote = app.vault.getMarkdownFiles().filter(
      (x) => x.basename == res.note
    ).first();
    if (foundNote) {
      embedHtml.childNodes.forEach((x) => {
        x.remove();
      });
      const linkRange = embedHtml.querySelectorAll("div.link-range-embed");
      linkRange.forEach((x) => {
        x.remove();
      });
      if (isMarkdownPost) {
        embedHtml.removeClasses(["internal-embed"]);
        embedHtml = embedHtml.createDiv({
          cls: ["internal-embed", "markdown-embed", "inline-embed", "is-loaded", "link-range-embed"]
        });
      }
      embedHtml.setText("");
      embedHtml.createEl("h2", {
        text: res.altText
      });
      const linkDiv = embedHtml.createDiv({
        cls: ["markdown-embed-link"]
      });
      (0, import_obsidian2.setIcon)(linkDiv, "link");
      linkDiv.onClickEvent((ev) => {
        const leaf = app.workspace.getMostRecentLeaf();
        leaf == null ? void 0 : leaf.openFile(foundNote, {
          state: {
            scroll: res.h1Line
          }
        });
      });
      const fileContent = await vault.cachedRead(foundNote);
      let lines = fileContent.split("\n");
      lines = lines.slice(res.h1Line, res.h2Line);
      const contentDiv = embedHtml.createDiv({
        cls: ["markdown-embed-content"]
      });
      import_obsidian2.MarkdownRenderer.renderMarkdown(lines.join("\n"), contentDiv, "", null);
    }
  }
}

// src/markdownPostProcessor.ts
function linkRangePostProcessor(app, el, ctx, settings) {
  const links = el.querySelectorAll("a.internal-link");
  links.forEach((link) => {
    const htmlLink = link;
    const res = checkLink(app, htmlLink, settings);
    if (res !== null) {
      if (res.altText) {
        htmlLink.setText(res.altText);
      }
      htmlLink.setAttribute("href", res.note + "#" + res.h1);
      htmlLink.setAttribute("data-href", res.note + "#" + res.h1);
      htmlLink.setAttribute("range-href", res.note + "#" + res.h1 + settings.headingSeparator + res.h2);
    }
  });
  const embeds = el.querySelectorAll("span.internal-embed");
  embeds.forEach((embed) => {
    replaceEmbed(app, embed, settings, true);
  });
}

// src/linkRangeView.ts
var import_view = require("@codemirror/view");
var import_obsidian3 = require("obsidian");
var import_state = require("@codemirror/state");
var LinkRangeView = class {
  constructor(settings, app) {
    this.decorations = import_view.Decoration.none;
    this.settings = settings;
    this.app = app;
  }
  buildDecorations(view) {
    const buffer = new import_state.RangeSetBuilder();
    const embeds = view.contentDOM.querySelectorAll("div.markdown-embed");
    embeds.forEach((embed) => {
      replaceEmbed(this.app, embed, this.settings);
    });
    return buffer.finish();
  }
  update(update) {
    if (!update.state.field(import_obsidian3.editorLivePreviewField)) {
      this.decorations = import_view.Decoration.none;
      return;
    }
    if (update.docChanged || update.viewportChanged || update.focusChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }
};

// main.ts
var LinkRange = class extends import_obsidian4.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new LinkRangeSettingTab(this.app, this));
    const settings = this.settings;
    this.registerMarkdownPostProcessor((el, ctx) => {
      linkRangePostProcessor(this.app, el, ctx, settings);
    });
    this.app.workspace.onLayoutReady(() => {
      this.registerEditorExtension(import_view2.ViewPlugin.define((v) => {
        return new LinkRangeView(this.settings, this.app);
      }));
      const pagePreviewPlugin = this.app.internalPlugins.plugins["page-preview"];
      console.log("LinkRange: Hooking into page-preview onHover calls");
      const uninstaller = around(pagePreviewPlugin.instance.constructor.prototype, {
        onHoverLink(old) {
          return function(options, ...args) {
            return old.call(this, options, ...args);
          };
        },
        onLinkHover(old) {
          return function(parent, targetEl, linkText, path, state, ...args) {
            const res = checkLink(this.app, targetEl, settings, false, "range-href");
            if (res !== null) {
              old.call(this, parent, targetEl, res.note, path, { scroll: res.h1Line }, ...args);
            } else {
              old.call(this, parent, targetEl, linkText, path, state, ...args);
            }
          };
        }
      });
      this.register(uninstaller);
      pagePreviewPlugin.disable();
      pagePreviewPlugin.enable();
      this.register(function() {
        if (!pagePreviewPlugin.enabled)
          return;
        pagePreviewPlugin.disable();
        pagePreviewPlugin.enable();
      });
    });
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};