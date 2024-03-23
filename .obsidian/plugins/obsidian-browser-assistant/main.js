var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// src/main.ts
__markAsModule(exports);
__export(exports, {
  default: () => main_default
});
var import_obsidian = __toModule(require("obsidian"));
var import_http = __toModule(require("http"));
var HOSTNAME = "127.0.0.1";
var DEFAULT_SETTINGS = {
  showData: true,
  showNotice: false,
  port: 27125,
  usedPlugin: "Omnisearch",
  maxNum: 15
};
var Browser_assistant = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    let sleep = (time) => new Promise((resolve) => {
      setTimeout(resolve, time);
    });
    await sleep(3e3);
    switch (this.settings.usedPlugin) {
      case "Omnisearch":
        if (!app.plugins.plugins.omnisearch) {
          new import_obsidian.Notice("\u672A\u68C0\u6D4B\u5230 Omnisearch \u63D2\u4EF6");
        }
        break;
      case "\u5168\u5C40\u641C\u7D22":
        if (!app.internalPlugins.plugins["global-search"].enabled) {
          new import_obsidian.Notice("\u672A\u68C0\u6D4B\u5230\u5168\u5C40\u641C\u7D22\u63D2\u4EF6");
        }
        break;
    }
    this.server = new Server(this.settings.port, this, this.settings.usedPlugin);
    this.addSettingTab(new SampleSettingTab(this.app, this));
  }
  onunload() {
    this.server.close();
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var main_default = Browser_assistant;
var SampleSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app2, plugin) {
    super(app2, plugin);
    this.plugin = plugin;
  }
  display() {
    let {containerEl} = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("\u76D1\u542C\u7AEF\u53E3").setDesc("\u9ED8\u8BA4\u4E3A 27125").addText((text) => text.setPlaceholder("Port").setValue(this.plugin.settings.port.toString()).onChange(async (value) => {
      this.plugin.settings.port = Number(value);
      this.plugin.server.switchPort(Number(value));
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u663E\u793A\u542F\u52A8 Notice").setDesc("\u670D\u52A1\u8FD0\u884C\u6210\u529F\u65F6\u663E\u793A Notice").addToggle((text) => text.setValue(this.plugin.settings.showNotice).onChange(async (value) => {
      this.plugin.settings.showNotice = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u63A7\u5236\u53F0\u663E\u793A\u6570\u636E").setDesc("\u6253\u5F00\u65F6\u5728\u63A7\u5236\u53F0\u91CC\u663E\u793A\u901A\u4FE1\u6570\u636E").addToggle((text) => text.setValue(this.plugin.settings.showData).onChange(async (value) => {
      this.plugin.settings.showNotice = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u641C\u7D22\u4F7F\u7528\u7684\u63D2\u4EF6").setDesc("\u9ED8\u8BA4 Omnisearch").addDropdown((text) => text.addOptions({
      Omnisearch: "Omnisearch",
      \u5168\u5C40\u641C\u7D22: "\u5168\u5C40\u641C\u7D22"
    }).setValue(this.plugin.settings.usedPlugin).onChange(async (value) => {
      this.plugin.settings.usedPlugin = value;
      this.plugin.server.switchUsedPlugin(value);
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u5168\u5C40\u641C\u7D22\u6700\u5927\u6570\u91CF").setDesc("\u9ED8\u8BA4\u4E3A 15").addSlider((text) => text.setLimits(1, 30, 1).setDynamicTooltip().setValue(this.plugin.settings.maxNum).onChange(async (value) => {
      this.plugin.settings.maxNum = value;
      await this.plugin.saveSettings();
    }));
  }
};
var Server = class {
  constructor(port, plugin, used_plugin) {
    this.plugin = plugin;
    this.port = port;
    this.switchUsedPlugin(used_plugin);
    this.init();
  }
  init() {
    this.server = import_http.default.createServer((request, response) => {
      let data = "";
      request.on("data", (chunk) => {
        data += chunk;
      });
      request.on("end", async () => {
        if (!data)
          return;
        let str = {...JSON.parse(data)};
        let query = decodeURIComponent(str["query"].replace(/\+/g, " "));
        let result = await this.search(query);
        let title = app.title.split(" - ")[0];
        result = result.map((p) => {
          return {...p, vault: title};
        });
        if (this.plugin.settings.showData)
          console.log(query, result);
        response.setHeader("content-type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.end(JSON.stringify(result));
      });
    });
    this.server.listen(this.port, HOSTNAME);
    console.log(`Browser assistant listening on http://${HOSTNAME}:${this.port}/`);
    if (this.plugin.settings.showNotice)
      new import_obsidian.Notice("Browser assistant \u670D\u52A1\u8FD0\u884C\u6210\u529F", 5e3);
  }
  async searchWithGlobalSearch(query) {
    let _a;
    const searchView = (_a = app.workspace.getLeavesOfType("search")[0]) === null || _a === void 0 ? void 0 : _a.view;
    searchView.setQuery(query);
    let state = searchView.getState(), searchQuery = searchView.searchQuery, resultDOM = searchView.dom, queue = searchView.queue.start().items.queue, searchResult = await Promise.all(queue.map(async (p) => {
      let c = await app.vault.cachedRead(p);
      return {
        file: p,
        content: c,
        result: searchQuery.match(p, c, searchQuery.matcher)
      };
    }));
    searchResult = searchResult.filter((p) => p.result);
    searchResult.forEach((p) => {
      resultDOM.addResult(p.file, p.result, p.content, true);
    });
    let result = [], v = Array.from(searchView.dom.resultDomLookup.values()), matcher = searchQuery.matcher.matchers ? searchQuery.matcher.matchers.map((p) => p.text) : [searchQuery.matcher.text];
    for (const i of v) {
      let c = i.result.content[0], p = app.metadataCache.getFileCache(i.file), d = p.listItems, f = p.sections, pos;
      if (state.extraContext)
        pos = i.getMatchExtraPositions(i.content, c, d, f);
      else
        pos = i.getMatchMinimalPositions(i.content, c);
      let data = {
        basename: i.file.basename,
        path: i.file.path,
        foundWords: matcher,
        excerpt: i.content.substr(pos[0], pos[1] - pos[0])
      };
      result.push(data);
      if (result.length >= this.plugin.settings.maxNum)
        break;
    }
    searchView.setQuery("");
    searchView.dom.emptyResults();
    return result;
  }
  switchPort(port) {
    this.port = port;
    this.server.close();
    this.init();
  }
  async switchUsedPlugin(used_plugin) {
    this.used_plugin = used_plugin;
    switch (this.used_plugin) {
      case "Omnisearch":
        let s;
        let wait = async function() {
          if (!app.plugins.plugins.omnisearch.api.search) {
            await new Promise(function(resolve, reject) {
              setTimeout(function() {
                wait();
                resolve();
              }, 100);
            });
          } else {
            s = app.plugins.plugins.omnisearch.api.search;
          }
        };
        await wait();
        this.search = s;
        break;
      case "\u5168\u5C40\u641C\u7D22":
        this.search = this.searchWithGlobalSearch;
        break;
    }
  }
  close() {
    this.server.close();
  }
};
