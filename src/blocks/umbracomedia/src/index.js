/**
 * **********************************************
 * Umbraco Media Tool for the Editor.js
 * **********************************************
 * @author CodeX <team@ifmo.su> + mindrevolution <stuttgart@mindrevolution.com>
 * @license MIT
 * @see {@link https://github.com/mindrevolution/Editor.js-for-Umbraco}
 *
 * To developers.
 * To simplify Tool structure, we split it to 4 parts:
 *  1) index.js — main Tool's interface, public API and methods for working with data
 *  2) uploader.js — module that has methods for sending files via AJAX: from device, by URL or File pasting
 *  3) ui.js — module for UI manipulations: render, showing preloader, etc
 *  4) tunes.js — working with Block Tunes: render buttons, handle clicks
 *
 * image: {
 *   class: UmbracoMedia,
 *   config: {
 *     endpoints: {
 *       byFile: 'http://localhost/byFile',
 *       byUrl: 'http://localhost/byUrl',
 *       moveMedia: 'http://localhost/moveMedia',
 *     }
 *   },
 * },
 */

/**
 * @typedef {object} ImageToolData
 * @description Image Tool's input and output data format
 * @property {string} caption — image caption
 * @property {boolean} withBorder - should image be rendered with border
 * @property {boolean} withBackground - should image be rendered with background
 * @property {boolean} stretched - should image be stretched to full width of container
 * @property {object} file — Image file data returned from backend
 * @property {string} file.url — image URL
 */

// eslint-disable-next-line
import css from './index.css';
import Ui from './ui';
import Tunes from './tunes';
import ToolboxIcon from './svg/toolbox.svg';
import Uploader from './uploader';
import ajax from '@codexteam/ajax';

/**
 * @typedef {object} ImageConfig
 * @description Config supported by Tool
 * @property {object} endpoints - upload endpoints
 * @property {string} endpoints.byFile - upload by file
 * @property {string} endpoints.byUrl - upload by URL
 * @property {string} endpoints.moveMedia - move media item
 * @property {string} field - field name for uploaded image
 * @property {string} types - available mime-types
 * @property {string} captionPlaceholder - placeholder for Caption field
 * @property {object} additionalRequestData - any data to send with requests
 * @property {object} additionalRequestHeaders - allows to pass custom headers with Request
 * @property {string} buttonContent - overrides for Select File button
 * @property {object} [uploader] - optional custom uploader
 * @property {function(File): Promise.<UploadResponseFormat>} [uploader.uploadByFile] - method that upload image by File
 * @property {function(string): Promise.<UploadResponseFormat>} [uploader.uploadByUrl] - method that upload image by URL
 */

/**
 * @typedef {object} UploadResponseFormat
 * @description This format expected from backend on file uploading
 * @property {number} success - 1 for successful uploading, 0 for failure
 * @property {object} file - Object with file data.
 *                           'url' is required,
 *                           also can contain any additional data that will be saved and passed back
 * @property {string} file.url - [Required] image source URL
 */
export default class UmbracoMedia {
  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @return {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: ToolboxIcon,
      title: 'Image'
    };
  }

  /**
   * @param {ImageToolData} data - previously saved data
   * @param {ImageConfig} config - user config for Tool
   * @param {object} api - Editor.js API
   */
  constructor({ data, config, api }) {
    this.api = api;

    /**
     * Tool's initial config
     */
    this.config = {
      endpoints: config.endpoints || '',
      additionalRequestData: config.additionalRequestData || {},
      additionalRequestHeaders: config.additionalRequestHeaders || {},
      field: config.field || 'image',
      types: config.types || 'image/*',
      captionPlaceholder: config.captionPlaceholder || 'Caption',
      buttonContent: config.buttonContent || '',
      uploader: config.uploader || undefined,
      umbEditorService: config.editorService || undefined
    };

    /**
     * Module for file uploading
     */
    this.uploader = new Uploader({
      config: this.config,
      onUpload: (response) => this.onUpload(response),
      onError: (error) => this.uploadingFailed(error)
    });

    /**
     * Module for working with UI
     */
    this.ui = new Ui({
      api,
      config: this.config,
      onPickMedia: () => {
        const block = this;
        const editorService = this.config.umbEditorService;

        editorService.mediaPicker({
          multiPicker: false,
          onlyImages: true,
          disableFolderSelect: true,
          submit: function (result) {
            editorService.close();
            var media = result.selection[0];

            block.image = {
              url: media.image + '?width=1000&mode=max&format=jpeg&quality=90',
              udi: media.udi
            };
          },
          close: function () {
            editorService.close();
          }
        });
      }
    });

    /**
     * Module for working with tunes
     */
    this.tunes = new Tunes({
      api,
      onChange: (tuneName) => this.tuneToggled(tuneName)
    });

    /**
     * Set saved state
     */
    this._data = {};
    this.data = data;
  }

  /**
   * Renders Block content
   * @public
   *
   * @return {HTMLDivElement}
   */
  render() {
    return this.ui.render(this.data);
  }

  /**
   * Return Block data
   * @public
   *
   * @return {ImageToolData}
   */
  save() {
    const caption = this.ui.nodes.caption;

    this._data.caption = caption.innerHTML;

    return this.data;
  }

  /**
   * Makes buttons with tunes: add background, add border, stretch image
   * @public
   *
   * @return {Element}
   */
  renderSettings() {
    return this.tunes.render(this.data);
  }

  /**
   * Fires after clicks on the Toolbox Image Icon
   * Initiates click on the Select File button
   * @public
   */
  appendCallback() {
    this.ui.nodes.pickerButton.click();
  }

  /**
   * Specify paste substitutes
   *
   * @see {@link https://github.com/codex-team/editor.js/blob/master/docs/tools.md#paste-handling}
   */
  static get pasteConfig() {
    return {
      /**
       * Paste HTML into Editor
       */
      tags: [ 'img' ],

      /**
       * Paste URL of image into the Editor
       */
      patterns: {
        image: /https?:\/\/\S+\.(gif|jpe?g|tiff|png)$/i
      },

      /**
       * Drag n drop file from into the Editor
       */
      files: {
        mimeTypes: [ 'image/*' ]
      }
    };
  }

  /**
   * Specify paste handlers
   * @public
   *
   * @see {@link https://github.com/codex-team/editor.js/blob/master/docs/tools.md#paste-handling}
   */
  async onPaste(event) {
    switch (event.type) {
      case 'tag':
        const image = event.detail.data;

        /** Images from PDF */
        if (/^blob:/.test(image.src)) {
          const response = await fetch(image.src);
          const file = await response.blob();

          this.uploadFile(file);
          break;
        }

        this.uploadUrl(image.src);
        break;

      case 'pattern':
        const url = event.detail.data;

        this.uploadUrl(url);
        break;

      case 'file':
        const file = event.detail.file;

        this.uploadFile(file);
        break;
    }
  }

  /**
   * Private methods
   * ̿̿ ̿̿ ̿̿ ̿'̿'\̵͇̿̿\з= ( ▀ ͜͞ʖ▀) =ε/̵͇̿̿/’̿’̿ ̿ ̿̿ ̿̿ ̿̿
   */

  /**
   * Stores all Tool's data
   * @private
   *
   * @param {ImageToolData} data
   */
  set data(data) {
    this.image = data.file;

    this._data.caption = data.caption || '';
    this.ui.fillCaption(this._data.caption);

    Tunes.tunes.forEach(({ name: tune }) => {
      const value = data[tune] !== undefined ? data[tune] : false;

      this.setTune(tune, value);
    });
  }

  /**
   * Return Tool data
   * @private
   *
   * @return {ImageToolData} data
   */
  get data() {
    return this._data;
  }

  /**
   * Set new image file
   * @private
   *
   * @param {object} file - uploaded file data
   */
  set image(file) {
    this._data.file = file || {};

    if (file && file.url) {
      this.ui.fillImage(file.url);
    }
  }

  /**
   * File uploading callback
   * @private
   *
   * @param {UploadResponseFormat} response
   */
  onUpload(response) {
    if (response.success && response.file) {
      // - notify successful upload
      this.image = response.file;

      const editorService = this.config.umbEditorService;
      const moveMediaUrl = this.config.endpoints.moveMedia;
      const mediaUdi = response.file.udi;

      editorService.mediaPicker({
        multiPicker: false,
        onlyImages: false,
        disableFolderSelect: false,
        title: 'Sort media into folder?',
        submit: function (result) {
          editorService.close();
          const folder = result.selection[0];

          if (folder !== null) {
            // - move media to this folder!
            const folderUdi = folder.udi;

            // console.log("MOVE MEDIA", mediaUdi, folderUdi, folder);
            ajax.get({
              url: moveMediaUrl,
              data: {
                'media': mediaUdi,
                'folder': folderUdi
              }
            }).then(function (success) {
              // console.log("media moved", mediaUdi, folder, folderUdi);
            }).catch(function (error) {
              console.error(`Unable to move media: ${error.code}.`, mediaUdi, folder, folderUdi, 'Response:', error.body);
            });
          }
        },
        close: function () {
          editorService.close();
        }
      });
    } else {
      this.uploadingFailed('incorrect response: ' + JSON.stringify(response));
    }
  }

  /**
   * Media picker callback
   * @private
   *
   * @param {UploadResponseFormat} response
   */
  onMediaPick(file) {
    console.log('onMediaPick', file);
    this.image = file;
  }

  /**
   * Handle uploader errors
   * @private
   *
   * @param {string} errorText
   */
  uploadingFailed(errorText) {
    console.log('Image Tool: uploading failed because of', errorText);

    this.api.notifier.show({
      message: 'Can not upload an image, try another',
      style: 'error'
    });
    this.ui.hidePreloader();
  }

  /**
   * Callback fired when Block Tune is activated
   * @private
   *
   * @param {string} tuneName - tune that has been clicked
   */
  tuneToggled(tuneName) {
    // inverse tune state
    this.setTune(tuneName, !this._data[tuneName]);
  }

  /**
   * Set one tune
   * @param {string} tuneName - {@link Tunes.tunes}
   * @param {boolean} value - tune state
   */
  setTune(tuneName, value) {
    this._data[tuneName] = value;

    this.ui.applyTune(tuneName, value);

    if (tuneName === 'stretched') {
      const blockId = this.api.blocks.getCurrentBlockIndex();

      setTimeout(() => {
        /** Wait until api is ready */
        this.api.blocks.stretchBlock(blockId, value);
      }, 0);
    }
  }

  /**
   * Show preloader and upload image file
   *
   * @param {File} file
   */
  uploadFile(file) {
    this.uploader.uploadByFile(file, {
      onPreview: (src) => {
        this.ui.showPreloader(src);
      }
    });
  }

  /**
   * Show preloader and upload image by target url
   *
   * @param {string} url
   */
  uploadUrl(url) {
    this.ui.showPreloader(url);
    this.uploader.uploadByUrl(url);
  }
}
