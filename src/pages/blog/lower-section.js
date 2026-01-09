import React, { useEffect, useState } from "react";
import "./niche.sass";
import GenerateIcon from "../../images/Vector.png";
import CopyIconGrey from "../../images/copyIconGrey.png";
import { contentGenerator } from "middleware/chatgpt";
import { useDispatch } from "react-redux";
import { Spinner } from "react-bootstrap";
import { getNicheData, setNicheData } from "utils/cache";
import PropTypes from "prop-types";

const getPrompts = (type, params) => {
  switch (type) {
    case "Topics":
      return `10 SEO keyword clusters in the "${params?.searchTxt}" niche with ${params?.difficulty} difficulty. Only the main clusters, with no descriptions attached.`;
    case "Keywords":
      return `10 SEO keywords in the "${params?.searchTxt}" topic with ${params?.difficulty} difficulty.`;
    case "Blog Article Ideas":
      return `Generate 5 unique SEO-optimized blog article titles on "${params?.searchTxt}". Each title should: include the exact match keyword "${params?.searchTxt}". be less than 60 characters. include a number`;
    default:
      return `10 SEO keyword clusters in the "${params?.searchTxt}" niche with ${params?.difficulty} difficulty. Only the main clusters, with no descriptions attached.`;
  }
};

const LowerSection = (props) => {
  const {
    inputHandler = () => {},
    clickHandler = () => {},
    searchKeyword,
    clearKeyword,
    blogGenerateHandler = () => {},
  } = props;
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [copied, setCopied] = useState(null);

  const handleGenerateCallback = (res) => {
    setLoading(false);
    const options = res?.data?.text?.split("\n") ?? [];
    setList([...options]);
    const cacheData = JSON.parse(getNicheData()) ?? {};
    cacheData[props.title] = { keyword: searchKeyword, result: res?.data.text };
    setNicheData(JSON.stringify(cacheData));
  };

  const handleGenerateIdea = (event) => {
    event.preventDefault();
    setLoading(true);
    dispatch(
      contentGenerator(
        getPrompts(props.title, {
          searchTxt: searchKeyword,
          difficulty: props.difficulty,
        }),
        handleGenerateCallback
      )
    );
  };

  const reset = () => {
    setList([]);
    clearKeyword();
  };

  useEffect(() => {
    if (props.resetAll) {
      reset();
    }
  }, [props.resetAll]);

  const copyHandler = (item, i) => {
    setCopied(i);
    navigator.clipboard.writeText(item);
    setTimeout(() => {
      setCopied(null);
    }, 300);
  };

  const setDataFromCache = () => {
    const cacheData = JSON.parse(getNicheData())?.[props.title];
    if (cacheData?.keyword) {
      inputHandler(cacheData?.keyword);
    }

    if (cacheData?.result) {
      const options = cacheData?.result?.split("\n");
      setList([...options]);
    }
  };

  useEffect(() => {
    if (props.title) {
      setDataFromCache();
    }
  }, [props.title]);

  const getTextFromPoint = (val) => {
    const str = val.split(". ");
    str.splice(0, 1);
    return str.join("") ?? "";
  };

  return (
    <div className="lower-section-title">
      {props.title}
      {props.showInput && (
        <div className="input-container">
          <input
            type={"text"}
            value={searchKeyword}
            onChange={(e) => inputHandler(e.target.value)}
            className="inputField"
            placeholder="Enter your niche, topic, or keyword here"
          />
        </div>
      )}
      <div className="generate-clear-btn">
        <div
          className={"generate-btn"}
          onClick={
            searchKeyword && !loading ? (e) => handleGenerateIdea(e) : () => {}
          }
          style={{
            cursor: !searchKeyword || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <Spinner animation="border" size={"sm"} role="status" />
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <img style={{ width: 20, height: 20 }} src={GenerateIcon} />
              Generate
            </div>
          )}
        </div>

        {searchKeyword ? (
          <div
            onClick={reset}
            className="clear-btn"
            style={{ cursor: "pointer" }}
          >
            Clear
          </div>
        ) : null}
      </div>
      {list?.length ? (
        <div className="list-components">
          {list.map((item, index) => {
            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedItem(item);
                  clickHandler(getTextFromPoint(item));
                }}
                className={
                  selectedItem === item
                    ? "list-active list-items "
                    : "list-items"
                }
                style={{ cursor: "pointer" }}
              >
                <div className="list-title">{item}</div>
                <div className="count-container">
                  <div
                    onClick={() =>
                      copyHandler(item.split(".")?.[1] ?? "", index)
                    }
                    className={
                      copied === index ? "list-copy-text" : "list-copy-icon"
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {copied === index ? (
                      "Copied"
                    ) : (
                      <img
                        style={{ width: 15, height: 15 }}
                        src={CopyIconGrey}
                      />
                    )}
                  </div>
                  {props.arrowIcon && (
                    <div className="list-arrow-icon">{"->"}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {props.createBlogBtn && selectedItem && (
        <div
          className="create-blog-btn"
          onClick={() => {
            blogGenerateHandler(
              getTextFromPoint(selectedItem).replace(/"/g, "")
            );
          }}
        >
          <span>Create Blog Post</span>
        </div>
      )}
    </div>
  );
};

export default LowerSection;

LowerSection.propTypes = {
  inputHandler: PropTypes.func,
  clickHandler: PropTypes.func,
  blogGenerateHandler: PropTypes.func,
  searchKeyword: PropTypes.string,
  clearKeyword: PropTypes.string,
  difficulty: PropTypes.string,
  title: PropTypes.string,
  showInput: PropTypes.bool,
  createBlogBtn: PropTypes.bool,
  arrowIcon: PropTypes.bool,
  resetAll: PropTypes.any,
};
