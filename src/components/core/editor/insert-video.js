import React, { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { EditorUtils } from "@progress/kendo-react-editor";
import { Modal } from "react-bootstrap";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";

export const InsertVideo = (props) => {
  const { view } = props;
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    src: "",
    width: 650,
    height: 350,
  });
  const [linkError, setLinkError] = useState(false);

  const toggleModal = () => {
    setOpen(!open);
  };

  const convertUrl = (url) => {
    let link = url;
    if (link.indexOf("youtube") >= 0) {
      link = link.replace("watch?v=", "embed/");
      link = link.replace("/watch/", "/embed/");
    }
    if (link.match(/^youtu.be\/$/) >= 0) {
      link = link.replace("youtu.be/", "youtube.com/embed/");
    }
    return link;
  };
  const handleSubmit = (event, nodeType) => {
    event.preventDefault();
    const data = {
      src: convertUrl(formData.src),
      title: `video-embed-${new Date().getTime()}`,
      class: "video-embed",
      alt: `video-embed-${new Date().getTime()}`,
      width: `${formData.width}px`,
      height: `${formData.height}px`,
      style: `width: ${formData.width}px; height: ${formData.height}px`,
      scrolling: "yes",
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
    const newIframe = nodeType.createAndFill(attrs);
    EditorUtils.insertNode(view, newIframe, true);

    setOpen(!open);
    setFormData({ src: "", width: 650, height: 350 });
  };
  const handleChange = (event) => {
    const data = { ...formData };
    data[event.target.name] = event.target.value;
    setFormData(data);
  };
  const handleModal = () => {
    setOpen(!open);
    setFormData({ src: "", width: 650, height: 350 });
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
            <Modal.Title> Embed a YouTube Video</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(event) => handleSubmit(event, nodeType)}>
            <Form.Group>
              <label>YouTube video URL</label>
              <input
                type="text"
                className="form-control"
                value={formData?.src}
                name="src"
                onChange={handleChange}
                onFocus={() => setLinkError(false)}
              />
              {linkError && (
                <Form.Text className="text-danger">
                  Please provide valid YouTube URL.
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group>
              <label>Width (px)</label>
              <input
                type="number"
                className="form-control"
                value={formData?.width}
                name="width"
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <label>Height (px)</label>
              <input
                type="number"
                className="form-control"
                value={formData?.height}
                name="height"
                onChange={handleChange}
              />
            </Form.Group>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={linkError}
            >
              Add
            </button>
          </Form>
        </Modal.Body>
      </Modal>
      <Button
        type="button"
        title="Embed Video"
        disabled={
          !nodeType || !state || !EditorUtils.canInsert(state, nodeType)
        }
        onClick={() => toggleModal()}
      >
        <span className="k-icon k-i-youtube" />
      </Button>
    </React.Fragment>
  );
};

InsertVideo.propTypes = {
  view: PropTypes.any,
};
