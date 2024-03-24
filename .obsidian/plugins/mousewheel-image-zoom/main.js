/*
THIS IS A GENERATED/BUNDLED FILE BY ROLLUP
if you want to view the source visit the plugins github repository
*/

'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * ReplaceTerm enables us to store the parameters for a replacement to add a new size parameter.
 */
class ReplaceTerm {
    constructor(replaceFrom, replaceWith) {
        this.replaceFrom = replaceFrom;
        this.replaceWith = replaceWith;
    }
    // Generate a string that can be used in a string.replace() call as the string to replace
    getReplaceFromString(oldSize) {
        return this.replaceFrom(oldSize);
    }
    // Generate a string that can be used in a string.replace() call as the replacement string
    getReplaceWithString(newSize) {
        return this.replaceWith(newSize);
    }
}
class Util {
    /**
         * For a given file content decide if a string is inside a table
         * @param searchString string
         * @param fileValue file content
         * @private
         */
    static isInTable(searchString, fileValue) {
        return fileValue.search(new RegExp(`^\\|.+${searchString}.+\\|$`, "m")) !== -1;
    }
    /**
     * Get the image name from a given src uri of a local image
     * (URI like app://local/C:/.../image.png?1677337704730)
     * @param imageUri uri of the image
     * @private
     */
    static getLocalImageNameFromUri(imageUri) {
        imageUri = decodeURI(imageUri);
        const imageNameMatch = imageUri.match(/([^\/?\\]+)(\?.*?|)$/);
        const imageName = imageNameMatch ? imageNameMatch[1] : "";
        // Handle linux not correctly decoding the %2F before the Filename to a \
        const hasLinuxDecodingIssue = imageName.startsWith("2F");
        return hasLinuxDecodingIssue ? imageName.slice(2) : imageName;
    }
    /**
     * Get the parameters needed to handle the zoom for a local image.
     * Source can be either a obsidian link like [[image.png]] or a markdown link like [image.png](image.png)
     * @param imageName Name of the image
     * @param fileText content of the current file
     * @returns parameters to handle the zoom
     */
    static getLocalImageZoomParams(imageName, fileText) {
        imageName = this.determineImageName(imageName, fileText);
        // Get the folder name if the image is located in a folder
        const folderName = this.getFolderNameIfExist(imageName, fileText);
        imageName = `${folderName}${imageName}`;
        const isInTable = Util.isInTable(imageName, fileText);
        // Separator to use for the replacement
        const sizeSeparator = isInTable ? "\\|" : "|";
        // Separator to use for the regex: isInTable ? \\\| : \|
        const regexSeparator = isInTable ? "\\\\\\|" : "\\|";
        const imageAttributes = this.getImageAttributes(imageName, fileText);
        imageName = `${imageName}${imageAttributes}`;
        // check character before the imageName to check if markdown link or obsidian link
        const imageNamePosition = fileText.indexOf(imageName);
        const isObsidianLink = fileText.charAt(imageNamePosition - 1) === "[";
        if (isObsidianLink) {
            return Util.generateReplaceTermForObsidianSyntax(imageName, regexSeparator, sizeSeparator);
        }
        else {
            return Util.generateReplaceTermForMarkdownSyntax(imageName, regexSeparator, sizeSeparator, fileText);
        }
    }
    /**
     * When using markdown link syntax the image name can be encoded. This function checks if the image name is encoded and if not encodes it.
     *
     * @param origImageName Image name
     * @param fileText File content
     * @returns image name with the correct encoding
     */
    static determineImageName(origImageName, fileText) {
        const encodedImageName = encodeURI(origImageName);
        const spaceEncodedImageName = origImageName.replace(/ /g, "%20");
        // Try matching original, full URI encoded, and space encoded
        const imageNameVariants = [origImageName, encodedImageName, spaceEncodedImageName];
        for (const variant of imageNameVariants) {
            if (fileText.includes(variant)) {
                return variant;
            }
        }
        throw new Error("Image not found in file");
    }
    /**
    * Extracts the folder name from the given image name by looking for the first "[" or "(" character
    * that appears before the image name in the file text.
    * @param imageName The name of the image.
    * @param fileText The text of the file that contains the image.
    * @returns The name of the folder that contains the image, or an empty string if no folder is found.
    */
    static getFolderNameIfExist(imageName, fileText) {
        const index = fileText.indexOf(imageName);
        if (index === -1) {
            throw new Error("Image not found in file");
        }
        const stringBeforeFileName = fileText.substring(0, index);
        const lastOpeningBracket = stringBeforeFileName.lastIndexOf("["); // Obsidian link
        const lastOpeningParenthesis = stringBeforeFileName.lastIndexOf("("); // Markdown link
        const lastOpeningBracketOrParenthesis = Math.max(lastOpeningBracket, lastOpeningParenthesis);
        const folderName = stringBeforeFileName.substring(lastOpeningBracketOrParenthesis + 1);
        return folderName;
    }
    /**
* Extracts any image attributes like |ctr for ITS Theme that appear after the given image name in the file.
* @param imageName - The name of the image to search for.
* @param fileText - The content of the file to search in.
* @returns A string containing any image attributes that appear after the image name.
*/
    static getImageAttributes(imageName, fileText) {
        const index = fileText.indexOf(imageName);
        const stringAfterFileName = fileText.substring(index + imageName.length);
        const regExpMatchArray = stringAfterFileName.match(/([^\]]*?)\\?\|\d+]]|([^\]]*?)]]|/);
        if (regExpMatchArray) {
            if (!!regExpMatchArray[1]) {
                return regExpMatchArray[1];
            }
            else if (!!regExpMatchArray[2]) {
                return regExpMatchArray[2];
            }
        }
        return "";
    }
    /**
     * Get the parameters needed to handle the zoom for images in markdown format.
     * Example: ![image.png](image.png)
     * @param imageName Name of the image
     * @param fileText content of the current file
     * @returns parameters to handle the zoom
     * @private
     *
     */
    static generateReplaceTermForMarkdownSyntax(imageName, regexSeparator, sizeSeparator, fileText) {
        const sizeMatchRegExp = new RegExp(`${regexSeparator}(\\d+)]${escapeRegex("(" + imageName + ")")}`);
        const replaceSizeExistFrom = (oldSize) => `${sizeSeparator}${oldSize}](${imageName})`;
        const replaceSizeExistWith = (newSize) => `${sizeSeparator}${newSize}](${imageName})`;
        const replaceSizeNotExistsFrom = (oldSize) => `](${imageName})`;
        const replaceSizeNotExistsWith = (newSize) => `${sizeSeparator}${newSize}](${imageName})`;
        const replaceSizeExist = new ReplaceTerm(replaceSizeExistFrom, replaceSizeExistWith);
        const replaceSizeNotExist = new ReplaceTerm(replaceSizeNotExistsFrom, replaceSizeNotExistsWith);
        return {
            sizeMatchRegExp: sizeMatchRegExp,
            replaceSizeExist: replaceSizeExist,
            replaceSizeNotExist: replaceSizeNotExist,
        };
    }
    /**
     * Get the parameters needed to handle the zoom for images in markdown format.
     * Example: ![[image.png]]
     * @param imageName Name of the image
     * @param fileText content of the current file
     * @returns parameters to handle the zoom
     * @private
     *
     */
    static generateReplaceTermForObsidianSyntax(imageName, regexSeparator, sizeSeparator) {
        const sizeMatchRegExp = new RegExp(`${escapeRegex(imageName)}${regexSeparator}(\\d+)`);
        const replaceSizeExistFrom = (oldSize) => `${imageName}${sizeSeparator}${oldSize}`;
        const replaceSizeExistWith = (newSize) => `${imageName}${sizeSeparator}${newSize}`;
        const replaceSizeNotExistsFrom = (oldSize) => `${imageName}`;
        const replaceSizeNotExistsWith = (newSize) => `${imageName}${sizeSeparator}${newSize}`;
        const replaceSizeExist = new ReplaceTerm(replaceSizeExistFrom, replaceSizeExistWith);
        const replaceSizeNotExist = new ReplaceTerm(replaceSizeNotExistsFrom, replaceSizeNotExistsWith);
        return {
            sizeMatchRegExp: sizeMatchRegExp,
            replaceSizeExist: replaceSizeExist,
            replaceSizeNotExist: replaceSizeNotExist,
        };
    }
    /**
     * Get the parameters needed to handle the zoom for a remote image.
     * Format: https://www.example.com/image.png
     * @param imageUri URI of the image
     * @param fileText content of the current file
     * @returns parameters to handle the zoom
     */
    static getRemoteImageZoomParams(imageUri, fileText) {
        const isInTable = Util.isInTable(imageUri, fileText);
        // Separator to use for the replacement
        const sizeSeparator = isInTable ? "\\|" : "|";
        // Separator to use for the regex: isInTable ? \\\| : \|
        const regexSeparator = isInTable ? "\\\\\\|" : "\\|";
        return Util.generateReplaceTermForMarkdownSyntax(imageUri, regexSeparator, sizeSeparator, fileText);
    }
}
/**
 * Function to escape a string into a valid searchable string for a regex
 * @param string string to escape
 * @returns escaped string
 */
function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

var ModifierKey;
(function (ModifierKey) {
    ModifierKey["ALT"] = "AltLeft";
    ModifierKey["CTRL"] = "ControlLeft";
    ModifierKey["SHIFT"] = "ShiftLeft";
    ModifierKey["ALT_RIGHT"] = "AltRight";
    ModifierKey["CTRL_RIGHT"] = "ControlRight";
    ModifierKey["SHIFT_RIGHT"] = "ShiftRight";
})(ModifierKey || (ModifierKey = {}));
const DEFAULT_SETTINGS = {
    modifierKey: ModifierKey.ALT,
    stepSize: 25,
    initialSize: 500
};
class MouseWheelZoomPlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.isKeyHeldDown = false;
        this.wheelOpt = { passive: false };
        this.wheelEvent = 'wheel';
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.app.workspace.on("window-open", (newWindow) => this.registerEvents(newWindow.win));
            this.registerEvents(window);
            this.addSettingTab(new MouseWheelZoomSettingsTab(this.app, this));
            console.log("Loaded: Mousewheel image zoom");
        });
    }
    /**
     * When the config key is released, we enable the scroll again and reset the key held down flag.
     */
    onConfigKeyUp(currentWindow) {
        this.isKeyHeldDown = false;
        this.enableScroll(currentWindow);
    }
    onunload(currentWindow = window) {
        // Re-enable the normal scrolling behavior when the plugin unloads
        this.enableScroll(currentWindow);
    }
    /**
    * Registers image resizing events for the specified window
    * @param currentWindow window in which to register events
    * @private
    */
    registerEvents(currentWindow) {
        const doc = currentWindow.document;
        this.registerDomEvent(doc, "keydown", (evt) => {
            if (evt.code === this.settings.modifierKey.toString()) {
                this.isKeyHeldDown = true;
                if (this.settings.modifierKey !== ModifierKey.SHIFT && this.settings.modifierKey !== ModifierKey.SHIFT_RIGHT) { // Ignore shift to allow horizontal scrolling
                    // Disable the normal scrolling behavior when the key is held down
                    this.disableScroll(currentWindow);
                }
            }
        });
        this.registerDomEvent(doc, "keyup", (evt) => {
            if (evt.code === this.settings.modifierKey.toString()) {
                this.onConfigKeyUp(currentWindow);
            }
        });
        this.registerDomEvent(doc, "wheel", (evt) => {
            if (this.isKeyHeldDown) {
                // When for example using Alt + Tab to switch between windows, the key is still recognized as held down.
                // We check if the key is really held down by checking if the key is still pressed in the event when the
                // wheel event is triggered.
                if (!this.isConfiguredKeyDown(evt)) {
                    this.onConfigKeyUp(currentWindow);
                    return;
                }
                const eventTarget = evt.target;
                if (eventTarget.nodeName === "IMG") {
                    // Handle the zooming of the image
                    this.handleZoom(evt, eventTarget);
                }
            }
        });
    }
    /**
     * Handles zooming with the mousewheel on an image
     * @param evt wheel event
     * @param eventTarget targeted image element
     * @private
     */
    handleZoom(evt, eventTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageUri = eventTarget.attributes.getNamedItem("src").textContent;
            const activeFile = yield this.getActivePaneWithImage(eventTarget);
            let fileText = yield this.app.vault.read(activeFile);
            const originalFileText = fileText;
            // Get parameters like the regex or the replacement terms based on the fact if the image is locally stored or not.
            const zoomParams = this.getZoomParams(imageUri, fileText, eventTarget);
            // Check if there is already a size parameter for this image.
            const sizeMatches = fileText.match(zoomParams.sizeMatchRegExp);
            // Element already has a size entry
            if (sizeMatches !== null) {
                const oldSize = parseInt(sizeMatches[1]);
                let newSize = oldSize;
                if (evt.deltaY < 0) {
                    newSize += this.settings.stepSize;
                }
                else if (evt.deltaY > 0 && newSize > this.settings.stepSize) {
                    newSize -= this.settings.stepSize;
                }
                fileText = fileText.replace(zoomParams.replaceSizeExist.getReplaceFromString(oldSize), zoomParams.replaceSizeExist.getReplaceWithString(newSize));
            }
            else { // Element has no size entry -> give it an initial size
                const initialSize = this.settings.initialSize;
                var image = new Image();
                image.src = imageUri;
                var width = image.naturalWidth;
                var minWidth = Math.min(width, initialSize);
                fileText = fileText.replace(zoomParams.replaceSizeNotExist.getReplaceFromString(0), zoomParams.replaceSizeNotExist.getReplaceWithString(minWidth));
            }
            // Save changed size
            if (fileText !== originalFileText) {
                yield this.app.vault.modify(activeFile, fileText);
            }
        });
    }
    /**
     * Loop through all panes and get the pane that hosts a markdown file with the image to zoom
     * @param imageElement The HTML Element of the image
     * @private
     */
    getActivePaneWithImage(imageElement) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(((resolve, reject) => {
                this.app.workspace.iterateAllLeaves(leaf => {
                    if (leaf.view.containerEl.contains(imageElement) && leaf.view instanceof obsidian.MarkdownView) {
                        resolve(leaf.view.file);
                    }
                });
                reject(new Error("No file belonging to the image found"));
            }));
        });
    }
    getZoomParams(imageUri, fileText, target) {
        if (imageUri.contains("http")) {
            return Util.getRemoteImageZoomParams(imageUri, fileText);
        }
        else if (target.classList.value.match("excalidraw-svg.*")) {
            const src = target.attributes.getNamedItem("filesource").textContent;
            // remove ".md" from the end of the src
            const imageName = src.substring(0, src.length - 3);
            // Only get text after "/"
            const imageNameAfterSlash = imageName.substring(imageName.lastIndexOf("/") + 1);
            return Util.getLocalImageZoomParams(imageNameAfterSlash, fileText);
        }
        else if (imageUri.contains("app://")) {
            const imageName = Util.getLocalImageNameFromUri(imageUri);
            return Util.getLocalImageZoomParams(imageName, fileText);
        }
        throw new Error("Image is not zoomable");
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    // Utilities to disable and enable scrolling //
    preventDefault(ev) {
        ev.preventDefault();
    }
    /**
     * Disables the normal scroll event
     */
    disableScroll(currentWindow) {
        currentWindow.addEventListener(this.wheelEvent, this.preventDefault, this.wheelOpt);
    }
    /**
     * Enables the normal scroll event
     */
    enableScroll(currentWindow) {
        currentWindow.removeEventListener(this.wheelEvent, this.preventDefault, this.wheelOpt);
    }
    isConfiguredKeyDown(evt) {
        console.log(evt.altKey, evt.ctrlKey, evt.shiftKey, this.settings.modifierKey);
        switch (this.settings.modifierKey) {
            case ModifierKey.ALT:
            case ModifierKey.ALT_RIGHT:
                return evt.altKey;
            case ModifierKey.CTRL:
            case ModifierKey.CTRL_RIGHT:
                return evt.ctrlKey;
            case ModifierKey.SHIFT:
            case ModifierKey.SHIFT_RIGHT:
                return evt.shiftKey;
        }
    }
}
class MouseWheelZoomSettingsTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Settings for mousewheel zoom' });
        new obsidian.Setting(containerEl)
            .setName('Trigger Key')
            .setDesc('Key that needs to be pressed down for mousewheel zoom to work.')
            .addDropdown(dropdown => dropdown
            .addOption(ModifierKey.CTRL, "Ctrl")
            .addOption(ModifierKey.ALT, "Alt")
            .addOption(ModifierKey.SHIFT, "Shift")
            .addOption(ModifierKey.CTRL_RIGHT, "Right Ctrl")
            .addOption(ModifierKey.ALT_RIGHT, "Right Alt")
            .addOption(ModifierKey.SHIFT_RIGHT, "Right Shift")
            .setValue(this.plugin.settings.modifierKey)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.modifierKey = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Step size')
            .setDesc('Step value by which the size of the image should be increased/decreased')
            .addSlider(slider => {
            slider
                .setValue(25)
                .setLimits(0, 100, 1)
                .setDynamicTooltip()
                .setValue(this.plugin.settings.stepSize)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.stepSize = value;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName('Initial Size')
            .setDesc('Initial image size if no size was defined beforehand')
            .addSlider(slider => {
            slider
                .setValue(500)
                .setLimits(0, 1000, 25)
                .setDynamicTooltip()
                .setValue(this.plugin.settings.initialSize)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.initialSize = value;
                yield this.plugin.saveSettings();
            }));
        });
    }
}

module.exports = MouseWheelZoomPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsInNyYy91dGlsLnRzIiwibWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6bnVsbCwibmFtZXMiOlsiUGx1Z2luIiwiTWFya2Rvd25WaWV3IiwiUGx1Z2luU2V0dGluZ1RhYiIsIlNldHRpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF1REE7QUFDTyxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUU7QUFDN0QsSUFBSSxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssWUFBWSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDaEgsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDL0QsUUFBUSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0FBQ25HLFFBQVEsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFD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