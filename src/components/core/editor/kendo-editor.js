/* eslint-disable no-useless-escape */
import React, { useState, useCallback } from "react";
import {
  Editor,
  EditorTools,
  EditorUtils,
  ProseMirror,
} from "@progress/kendo-react-editor";
import _ from "lodash";
import PropTypes from "prop-types";
import { InsertImage } from "./insert-image";
import { iframe, shortCode, button, blockquote } from "./new-node";
import { InsertVideo } from "./insert-video";
import { CustomFontSize } from "./custom-font-size.js";
import { CustomFontFormat } from "./custom-font-format";
import { InsertEmoji } from "./insert-emoji";
import { InsertTweet } from "./insert-tweet";
import { InsertShortcodeTool } from "./insert-code";
import { Helmet } from "react-helmet";
import htmlToFormattedText from "html-to-formatted-text";
import { getSite } from "utils/helpers";
import { InsertButtonTool } from "./insert-button";
import { IdeaGenerator } from "./idea-generator";
import { WordCounter } from "./word-count";
import { ParaGenration } from "./paragraph-generator";
import "./kendo.sass";

const {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  OrderedList,
  UnorderedList,
  Undo,
  Redo,
  FontName,
  Link,
  Unlink,
  ViewHtml,
  InsertTable,
  AddRowBefore,
  AddRowAfter,
  AddColumnBefore,
  AddColumnAfter,
  DeleteRow,
  DeleteColumn,
  DeleteTable,
  MergeCells,
  SplitCell,
  ForeColor,
  BackColor,
} = EditorTools;

const {
  pasteCleanup,
  sanitize,
  sanitizeClassAttr,
  sanitizeStyleAttr,
  replaceImageSourcesFromRtf,
  imageResizing,
} = EditorUtils;

const pasteSettings = {
  convertMsLists: true,
  attributes: {
    class: sanitizeClassAttr,
    style: sanitizeStyleAttr,
    src: () => {},
  },
};
const { Schema, EditorView, EditorState } = ProseMirror;

const KendoEditor = (props) => {
  const {
    pageFormData,
    blogFormData,
    formName,
    handleSubmit,
    htmlData,
    setHtmlData,
    handleRTEdata,
    title,
  } = props;
  const site = getSite();
  const accentColor = site?.colors && JSON.parse(site?.colors)?.button;
  const [generatingParagraph, setGeneratingParagraph] = useState(false);
  const [generatingBlog, setGeneratingBlog] = useState(false);
  const onMount = (event) => {
    const { viewProps } = event;
    const { plugins, schema } = viewProps.state;

    // Adding the 'dir' attribute to paragraph node.
    const paragraph = {
      ...schema.spec.nodes.get("paragraph"),
    };
    paragraph.attrs = paragraph.attrs || {};
    paragraph.attrs["style"] = {
      default: "font-size: 16pt",
    };
    paragraph.attrs["dir"] = {
      default: null,
    };
    let nodes = schema.spec.nodes.update("paragraph", paragraph);

    // Appending the new node.
    nodes = nodes.addToEnd("blockquote", blockquote);
    nodes = nodes.addToEnd("iframe", iframe);
    nodes = nodes.addToEnd("shortCode", shortCode);
    nodes = nodes.addToEnd("button", button);

    //creating marks
    const marks = schema.spec.marks;

    const mySchema = new Schema({
      nodes,
      marks,
    });

    const doc = EditorUtils.createDocument(mySchema, htmlData);

    const editorView = new EditorView(
      {
        mount: event.dom,
      },
      {
        ...event.viewProps,
        state: EditorState.create({
          doc,
          plugins: [...plugins, imageResizing()],
        }),
      }
    );

    const editorContainer = document.querySelector(".k-editor-content");

    // Add click listener for selecting nodes
    editorContainer?.addEventListener(
      "click",
      (e) => {
        const clickedElement = e.target;
        if (clickedElement.tagName === "BUTTON") {
          e.preventDefault();
          e.stopPropagation();
          InsertButtonTool.open(clickedElement);
        }
      },
      true
    );

    return editorView;
  };

  const IdeaGeneratorTool = (p) => {
    return (
      <IdeaGenerator
        title={title}
        generatingParagraph={generatingParagraph}
        generatingBlog={generatingBlog}
        setGeneratingBlog={setGeneratingBlog}
        {...p}
      />
    );
  };

  const ParaGenrationTool = (p) => {
    return (
      <ParaGenration
        title={title}
        setGeneratingParagraph={setGeneratingParagraph}
        generatingParagraph={generatingParagraph}
        generatingBlog={generatingBlog}
        {...p}
      />
    );
  };

  const handleChange = (editor) => {
    const str = htmlToFormattedText(editor.html);
    handleRTEdata(editor.html, str);
  };
  const asyncValidateFunc = _.debounce(handleChange, 800);
  const asyncChangeCallback = useCallback(asyncValidateFunc, []);

  return (
    <div
      style={{
        ["--accent-color"]: accentColor,
      }}
    >
      <Helmet>
        <script async src="https://platform.twitter.com/widgets.js"></script>
      </Helmet>
      <Editor
        onPasteHtml={(e) => {
          try {
            let html = pasteCleanup(sanitize(e.pastedHtml), pasteSettings);
            if (e.nativeEvent.clipboardData) {
              html = replaceImageSourcesFromRtf(
                html,
                e.nativeEvent.clipboardData
              );
            }
            html && html.replace("^(s+<br( /)?>)$|(<br( /)?>s)$", "");
            return html;
          } catch (error) {
            console.log(error);
          }
        }}
        defaultEditMode="div"
        dir={{
          formData: blogFormData || pageFormData,
          formName: formName,
          handleSubmit: handleSubmit,
        }}
        tools={[
          [Bold, Italic, Underline, Strikethrough],
          [Subscript, Superscript],
          [AlignLeft, AlignCenter, AlignRight, AlignJustify],
          [Indent, Outdent],
          [OrderedList, UnorderedList],
          CustomFontSize,
          FontName,
          CustomFontFormat,
          ForeColor,
          BackColor,
          [Undo, Redo],
          [
            Link,
            Unlink,
            InsertImage,
            InsertVideo,
            InsertTweet,
            InsertEmoji,
            ViewHtml,
          ],
          InsertShortcodeTool,
          InsertButtonTool,
          [IdeaGeneratorTool],
          [ParaGenrationTool],
          [InsertTable],
          [AddRowBefore, AddRowAfter, AddColumnBefore, AddColumnAfter],
          [DeleteRow, DeleteColumn, DeleteTable],
          [MergeCells, SplitCell],
          [WordCounter],
        ]}
        onChange={(editor) => {
          setHtmlData(editor.html);
          asyncChangeCallback(editor);
        }}
        contentStyle={{
          minHeight: 630,
        }}
        onMount={onMount}
        value={htmlData || ""}
        defaultContent={htmlData || ""}
      />
    </div>
  );
};

KendoEditor.propTypes = {
  initialValue: PropTypes.any,
  pageFormData: PropTypes.any,
  blogFormData: PropTypes.string,
  title: PropTypes.string,
  formName: PropTypes.object,
  handleSubmit: PropTypes.func,
  htmlData: PropTypes.object,
  setHtmlData: PropTypes.func,
  handleRTEdata: PropTypes.func,
};

export default KendoEditor;
