import {LitElement, html, css, PropertyValues} from "lit";
import {property, query} from "lit/decorators.js";
import {EditorState, basicSetup} from "@codemirror/basic-setup";
import {EditorView, keymap, ViewUpdate} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands";
import {html as lang} from "@codemirror/lang-html";

export class KmapHtmlEditor extends LitElement {

  private _view!: EditorView;

  @property()
  public value: string = '';

  @query('#editor')
  _editor!: HTMLDivElement;

  constructor() {
    super();
    this._change = throttle(this._change, 2100, this);
  }

  firstUpdated() {
    this._view = new EditorView({
      state: EditorState.create({extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          //tabSize.of(EditorState.tabSize.of(2)),
          EditorView.updateListener.of(update => this._change(update)),
          lang()]}),
      parent: this._editor,
    });
  }

  private _change(change: ViewUpdate) {
    this.value = this._view.state.doc.toString();
    console.log(this.value);
    this.dispatchEvent(new CustomEvent('change', {bubbles: true, composed: true, detail: { value: this.value }}));
  }

  protected willUpdate(_changedProperties: PropertyValues) {
    if (_changedProperties.has("value") && this._view) {
      this._view.dispatch({
        changes: {from: 0, to: this._view.state.doc.length, insert: this.value}
      });
    }
  }

  static get styles() {
    // language=CSS
    return css`
    .cm-editor {
      border-bottom: 2px solid transparent;
      transition: border-bottom-color .3s ease-in-out;
    }
    .cm-editor.cm-focused {
      outline: none !important;
      border-bottom: 2px solid gray;
    }
    `;
  }

  protected render(): unknown {
    // language=HTML
    return html`<div id="editor"></div>`;
  }
}

/**
 * In case of a "storm of events", this executes once every $threshold
 * @param fn
 * @param threshold
 * @param scope
 * @returns {Function}
 */
export function throttle(fn: Function, threshold: number, scope: any) {
  threshold || (threshold = 250);
  var last: number;
  var deferTimer: any;

  return function() {
    // @ts-ignore
    var context = scope || this;
    var now = +new Date;
    var args = arguments;

    if (last && now < last + threshold) {
      // Hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function() {
        last = now;
        fn.apply(context, args);
      }, threshold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}
