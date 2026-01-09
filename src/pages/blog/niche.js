import React, { useEffect, useState } from "react";
import "./niche.sass";
import ResetIcon from "../../images/rotate.png";
import camera from "../../images/photography.png";
import software from "../../images/software.png";
import beauty from "../../images/beauty.png";
import electronics from "../../images/electronics.png";
import LowerSection from "./lower-section";
import { getMaxTokensCount, getPendingTokensCount } from "utils/helpers";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { ROUTES } from "constants/appRoutes";

const NICHE_SUGGESTIONS = [
  { emoji: "💰", text: "Personal Finance" },
  { image: electronics, text: "Electronics" },
  { image: beauty, text: "Beauty" },
  { emoji: "🤑", text: "Make Money Online" },
  { image: software, text: "Software" },
  { emoji: "👗", text: "Fashion" },
  { emoji: "🥗", text: "Nutrition" },
  { emoji: "❤️", text: "Health" },
  { emoji: "🍕", text: "Cooking" },
  { emoji: "🏋", text: "Fitness" },
  { emoji: "🛩", text: "Travel" },
  { image: camera, text: "Photography" },
  { emoji: "🌲", text: "Outdoors" },
  { emoji: "🚗", text: "Automotive" },
];
const DIFFICULTY = [
  { emoji: "😃", text: "Very Easy" },
  { emoji: "😊", text: "Easy" },
  { emoji: "😬", text: "Medium" },
  { emoji: "😅", text: "Hard" },
];

const Niche = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const totalTokens = getMaxTokensCount();
  const remainingTokens = getPendingTokensCount();
  const [niche, setNiche] = useState("");
  const [keyword, setKeyword] = useState("");
  const [ideas, setIdeas] = useState("");
  const [difficulty, setDifficulty] = useState("Very Easy");
  const [resetAll, setRestAll] = useState(false);

  const startResetting = () => {
    setRestAll(true);
    setTimeout(() => {
      setRestAll(false);
    }, 400);
  };

  const blogGenerateHandler = (idea) => {
    history.push(ROUTES.BLOG, { idea: idea });
  };

  const getPercentage = () => {
    const rt = remainingTokens ? remainingTokens.replace(/,/g, "") : 0;
    const tt = totalTokens.replace(/,/g, "");
    return (Number(rt) / Number(tt)) * 100;
  };

  useEffect(() => {
    dispatch({
      type: "SET_ACTIVE_SIDEBAR",
      payload: "/ideas",
    });
  }, []);

  return (
    <main className="dashboard-data createNewBlog createNewPage">
      <section data-tut="reactour__iso" className="dashboard-body">
        <div className="blog-niche-container">
          <div className="choose-niche-section">
            <div className="left-section">
              <div className="left-section-white-space">
                <div
                  className="left-section-gradient"
                  style={{ width: `${getPercentage()}%` }}
                />
              </div>
              <div style={{ fontSize: 16 }}>
                <b>{remainingTokens}</b>
                {` / ${totalTokens} tokens`}
                <Link to="/plan-selection" className="add-more pl-2">
                  Add more
                </Link>
              </div>
            </div>
            <div className="middle-section">
              <div className="choose-niche-heading">Choose Your Niche</div>

              <input
                className="choose-niche-input"
                placeholder="Enter custom niche here"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </div>
            <div className="right-section">
              <div className="reset-btn" onClick={startResetting}>
                <img src={ResetIcon} width={"20px"} height={"20px"} />
                Reset All
              </div>
            </div>
          </div>
          <div className="tab-section">
            {NICHE_SUGGESTIONS.map((suggestions, i) => {
              return (
                <div
                  key={`${suggestions.text}-${i}`}
                  className={
                    niche === suggestions.text
                      ? "tab-section-items niche-tab-active"
                      : "tab-section-items"
                  }
                  onClick={() => setNiche(suggestions.text)}
                >
                  <div className="tabTitle">
                    {suggestions?.image ? (
                      <img style={{ width: 20, height: 20 }} src={camera} />
                    ) : null}
                    {`${suggestions?.emoji ?? ""} ${suggestions.text}`}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="difficulty-section">
            <div className="difficulty-title">Difficulty</div>
            <div className="difficulty-tabs">
              {DIFFICULTY.map((diff, i) => {
                return (
                  <div
                    key={`${diff.text}-${i}`}
                    className={
                      difficulty === diff.text
                        ? "tab-section-items difficulty-tab-active"
                        : "tab-section-items"
                    }
                    onClick={() => setDifficulty(diff.text)}
                  >
                    <div className="tabTitle">{`${diff.emoji} ${diff.text}`}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lower-section">
            <LowerSection
              title={"Topics"}
              showInput={false}
              createBlogBtn={false}
              seeMoreBtn={true}
              countLabel={false}
              arrowIcon={true}
              clickHandler={(v) => setKeyword(v)}
              searchKeyword={niche}
              difficulty={difficulty}
              clearKeyword={() => setNiche("")}
              resetAll={resetAll}
              inputHandler={setNiche}
            />
            <LowerSection
              title={"Keywords"}
              showInput={true}
              createBlogBtn={false}
              seeMoreBtn={true}
              countLabel={true}
              clickHandler={(v) => setIdeas(v)}
              inputHandler={setKeyword}
              searchKeyword={keyword}
              arrowIcon={true}
              difficulty={difficulty}
              clearKeyword={() => setKeyword("")}
              resetAll={resetAll}
            />
            <LowerSection
              title={"Blog Article Ideas"}
              showInput={true}
              createBlogBtn={true}
              seeMoreBtn={false}
              countLabel={false}
              searchKeyword={ideas}
              inputHandler={setIdeas}
              arrowIcon={false}
              difficulty={difficulty}
              clearKeyword={() => setIdeas("")}
              resetAll={resetAll}
              blogGenerateHandler={blogGenerateHandler}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Niche;
