import * as React from "react";
import PropTypes from "prop-types";
import { EditorTools, EditorUtils } from "@progress/kendo-react-editor";
const fontSizeToolSettings = {
  style: "font-size",
  defaultItem: { text: "paragraph", value: "p" },
  items: [
    { text: "paragraph", value: "p", style: { fontSize: "large" } },
    {
      text: "Heading 1",
      value: "h2",
      valueS: "inherit",
      style: { fontSize: "1.3em", fontWeight: 500 },
    },
    {
      text: "Heading 2",
      value: "h3",
      valueS: "inherit",
      style: { fontSize: "1.1em", fontWeight: 500 },
    },
    {
      text: "Heading 3",
      value: "h4",
      valueS: "inherit",
      style: { fontSize: "0.9em", fontWeight: 500 },
    },
    {
      text: "Heading 4",
      value: "h5",
      valueS: "inherit",
      style: { fontSize: "0.8em", fontWeight: 500 },
    },
    {
      text: "Heading 5",
      value: "h6",
      valueS: "inherit",
      style: { fontSize: "0.7em", fontWeight: 500 },
    },
    {
      text: "Site Title",
      value: "h1",
      valueS: "inherit",
      style: { fontSize: "1.5em", fontWeight: 500 },
    },
  ],
  commandName: "FormatBlock",
};

// Creates FontSize tool
const MyFontSizeTool =
  EditorTools.createFormatBlockDropDownList(fontSizeToolSettings);
// Styles the FontSize tool
const CustomFontFormat = (props) => {
  const view = props.view;
  return (
    <MyFontSizeTool
      className="select-font-format"
      onChange={async (event) => {
        await EditorUtils.formatBlockElements(
          view,
          event.value.value,
          "FormatBlock"
        );
        await EditorUtils.applyInlineStyle(view, {
          style: fontSizeToolSettings.style,
          value: event.value.valueS,
        });
        var syntheticEvent = event.syntheticEvent;
        if (syntheticEvent && syntheticEvent.type === "click") {
          view.focus();
        }
      }}
      {...props}
      style={{
        width: "200px",
        fontSize: "16px",
        height: "36px",
        // eslint-disable-next-line react/prop-types
        ...props.style,
      }}
    />
  );
};
CustomFontFormat.propTypes = {
  view: PropTypes.any,
};
export { CustomFontFormat };
