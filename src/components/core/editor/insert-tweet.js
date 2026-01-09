import React, { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { EditorUtils } from "@progress/kendo-react-editor";
import { Modal } from "react-bootstrap";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";

export const InsertTweet = (props) => {
  const { view } = props;
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(null);

  const toggleModal = () => {
    setOpen(!open);
  };

  const getStatusId = () => {
    const dd = formData?.match(
      /https?:\/\/twitter.com\/[a-z0-9A-Z_-]{1,50}\/status\/([0-9]*)/
    );
    return dd && dd[1];
  };
  const getTheme = () => {
    if (formData) {
      const html =
        new DOMParser().parseFromString(formData, "text/html") || null;
      return html?.body?.firstElementChild?.dataset?.theme || "light";
    }
  };
  const handleSubmit = async (event, nodeType) => {
    event.preventDefault();
    console.log(nodeType);
    const statusID = getStatusId();
    const theme = getTheme();
    if (statusID) {
      const result = await window.twttr.widgets.createTweetEmbed(
        statusID,
        document.getElementById("tweetsample"),
        {
          theme: theme || "light",
        }
      );
      if (result) {
        const frame = result.firstElementChild;
        const style = `overflow: hidden; position: ${frame?.style?.position}; visibility: ${frame?.style?.visibility}; width: ${frame?.style?.width}; height: ${frame?.style?.height}; flex-grow: 1`;
        const data = {
          src: frame?.src,
          width: frame?.style?.width || "400px",
          height: frame?.style?.height || "200px",
          id: frame?.id,
          alt: frame?.dataset?.tweetId,
          class: "twitter-embed-card",
          allowfullscreen: true,
          style: style,
          scrolling: "no",
          allowtransparency: true,
          title: frame?.title,
          data: {
            "tweet-id": frame?.dataset?.tweetId,
          },
        };
        const attrs = Object.keys(data)
          .filter((key) => data[key] !== null && data[key] !== "")
          .reduce(
            (acc, curr) =>
              Object.assign(acc, {
                [curr]: data[curr],
              }),
            {}
          );
        document.getElementById("tweetsample").innerHTML = "";
        const newIframe = nodeType.createAndFill(attrs);
        EditorUtils.insertNode(view, newIframe, true);
      }
    }

    setOpen(!open);
  };
  const handleChange = (event) => {
    setFormData(event.target.value);
  };
  const handleModal = () => {
    setOpen(!open);
    setFormData(null);
  };
  const state = view && view.state;
  const nodeType = state ? state.schema.nodes["iframe"] : undefined;
  return (
    <React.Fragment>
      <Modal
        show={open}
        onHide={handleModal}
        className="image-upload-modal new-modal embed-link-modal"
      >
        <Modal.Header closeButton>
          <div className="new-modal-header">
            <Modal.Title>Add Embed Tweet</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(event) => handleSubmit(event, nodeType)}>
            <Form.Group>
              <textarea
                rows="8"
                className="form-control"
                value={formData}
                name="data"
                onChange={handleChange}
              />
            </Form.Group>
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </Form>
          <div id="tweetsample" style={{ height: "0px", width: "100%" }}></div>
        </Modal.Body>
      </Modal>
      <Button
        type="button"
        title="Embed Tweet"
        disabled={
          !nodeType || !state || !EditorUtils.canInsert(state, nodeType)
        }
        onClick={() => toggleModal()}
      >
        <span className="k-icon k-i-twitter" />
      </Button>
    </React.Fragment>
  );
};

InsertTweet.propTypes = {
  view: PropTypes.any,
};
