import {css, html, LitElement, PropertyValues} from "lit";
import {property, query, state} from "lit/decorators.js";
import {
  EditorView,
  gutter, highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  ViewUpdate
} from "@codemirror/view";
import {defaultKeymap, history, historyKeymap, indentSelection, indentWithTab} from "@codemirror/commands";
import {html as lang} from "@codemirror/lang-html";
import {EditorState} from "@codemirror/state";
import {bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting} from "@codemirror/language";
import {autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap} from "@codemirror/autocomplete";
import {searchKeymap} from "@codemirror/search";

export class KmapHtmlEditor extends LitElement {

  @state()
  private _view!: EditorView;

  private _value: string = '';

  @query('#editor')
  _editor!: HTMLDivElement;

  @property()
  private placeholder?: string = undefined;

  constructor() {
    super();
    this._change = throttle(this._change, 2100, this);
  }

  firstUpdated() {
    /*
    if (this.placeholder)
      extensions.push(placeholder(this.placeholder))
    */
    this._view = new EditorView({
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        //rectangularSelection(),
        //crosshairCursor(),
        highlightActiveLine(),
        //highlightSelectionMatches(),
        keymap.of([
          {key: 'Ctrl-Alt-i', run: indentSelection},
          //indentWithTab,
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          //...foldKeymap,
          ...completionKeymap,
          //...lintKeymap,
        ]),
        EditorView.updateListener.of(update => this._change(update)),
        lang({extraTags: {
            "container": {globalAttrs: false, children: ["box", "growbox"]},
          }}),
        EditorState.tabSize.of(2),
        EditorView.lineWrapping,
      ],
      parent: this.shadowRoot!,
    });
  }

  set value(value: string) {
    const old = this._value;
    this._value = value;
    this.requestUpdate('value', old);
  }

  @property()
  get value() { return this._value; }

  private _change(change: ViewUpdate) {
    this._value = this._view.state.doc.toString();
    this.dispatchEvent(new CustomEvent('change', {bubbles: true, composed: true, detail: { value: this.value }}));
  }

  protected willUpdate(_changedProperties: PropertyValues) {
    if ((_changedProperties.has("value") || _changedProperties.has("_view")) && this._view) {
      this._view.dispatch({
        changes: {from: 0, to: this._view.state.doc.length, insert: this.value}
      });
    }
  }

  static get styles() {
    // language=CSS
    return css`
      .cm-editor {
        height: 100%;
        border-bottom: 2px solid transparent;
        transition: border-bottom-color .3s ease-in-out;
      }
      .cm-editor.cm-focused {
        outline: none !important;
        border-bottom: 2px solid #4c8bba;
      }
      .cm-scroller {
        overflow: auto;
      }
    `;
  }

  protected render(): unknown {
    // language=HTML
    //return html`<div id="editor"></div>`;
    return html``;
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
