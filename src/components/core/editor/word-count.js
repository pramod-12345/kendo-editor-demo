import React from "react";
import PropTypes from "prop-types";
import { Button } from "@progress/kendo-react-buttons";
import { EditorUtils } from "@progress/kendo-react-editor";
import "./kendo.sass";

export const WordCounter = (props) => {
  const { view } = props;

  const state = (view && view?.state) ?? null;

  const getWordCount = () => {
    try {
      const currentHtml = state ? EditorUtils.getHtml(state) : "";
      const regex = /<br>(?=(?:\s*<[^>]*>)*$)|(<br>)|<[^>]*>/gi;
      const str = currentHtml?.replace(regex, (x, y) => (y ? " & " : ""));
      return str?.length > 0 ? str?.split(" ")?.length : 0;
    } catch (e) {
      console.log(e);
      return 0;
    }
  };

  return (
    <React.Fragment>
      <Button
        title="Word Count"
        type="button"
        disabled
        className="text-dark font-weight-bold"
      >{`Word Count : ${getWordCount()}`}</Button>
    </React.Fragment>
  );
};

WordCounter.propTypes = {
  view: PropTypes.any,
};
