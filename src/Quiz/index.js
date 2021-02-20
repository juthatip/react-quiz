import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// import Checkboxes from "./Checkbox";
import { Container, Checkbox, Button, Grid } from "@material-ui/core";

import TimerIcon from "@material-ui/icons/Timer";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

let checked = [];

function Quiz() {
  const [allQuestion, setAllQuestion] = useState([]);
  const [quiz, setQuiz] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [scores, setScores] = useState(0);
  const [timer, setTimer] = useState(null);
  const [isFinish, setIsFinish] = useState(false);
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const [userProfile, setUserProfile] = useState([]);
  // const [checkedTest, setChecked] = useState([]);

  let userId = 1;

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("http://localhost:4000/api/quiz/1");
      setAllQuestion(response.data);
      if (response.data) {
        let displayQuestion = response.data.filter(
          (d) => d.id === currentQuestion
        );
        setQuiz(() => displayQuestion[0]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await axios.get("http://localhost:4000/api/topic/");
      if (response && response.data) {
        let getUserProfile = response.data.filter((d) => d.id === userId);
        if (getUserProfile.length) {
          setUserProfile(() => getUserProfile[0]);
          setTimer(getUserProfile[0].timer);
        }
      }
    };
    fetchUserData();
  }, []);

  const [anwsers, setAnwsers] = useState(() => []);
  const [isSelect, setIsSelect] = useState(() => "");
  const [isChecked, setIsChecked] = useState(() => {});

  function setNextQuestion(currentQuestion) {
    currentQuestion = currentQuestion + 1;
    setCurrentQuestion(() => currentQuestion);
    let displayQuestion = allQuestion.filter((d) => d.id === currentQuestion);
    let ansQuiz = anwsers.filter((a) => a.id === currentQuestion);
    let isSelectAns = ansQuiz.length > 0 ? ansQuiz[0].answer : "";

    setQuiz(() => displayQuestion[0]);
    setIsSelect(() => isSelectAns);

    setIsChecked(() => {});
    checked = {};
    if (ansQuiz.length > 0 && ansQuiz[0].type === "multiple") {
      let defaultAns = ansQuiz[0].answer.reduce((result, item, i) => {
        result[item] = true;
        return result;
      }, {});
      setIsChecked({
        ...defaultAns,
      });
    }
  }

  function setPrevQuestion(currentQuestion) {
    currentQuestion = currentQuestion - 1;
    setCurrentQuestion(() => currentQuestion);
    let displayQuestion = allQuestion.filter((d) => d.id === currentQuestion);
    setQuiz(() => displayQuestion[0]);
    let ansQuiz = anwsers.filter((a) => a.id === currentQuestion);
    let isSelectAns = ansQuiz.length > 0 ? ansQuiz[0].answer : "";
    setIsSelect(isSelectAns);

    checked = {};
    if (ansQuiz.length > 0 && ansQuiz[0].type === "multiple") {
      let defaultAns = ansQuiz[0].answer.reduce((result, item, i) => {
        result[item] = true;
        return result;
      }, {});

      setIsChecked({
        ...defaultAns,
      });
    }
  }

  function selectAnswer(id, result, type) {
    let answer = { id, answer: result, type };
    let ans = anwsers.filter((data) => data.id !== id);
    setIsSelect(result);
    setAnwsers([...ans, answer]);
    setIsChecked({});
  }

  const selectAnswerCheckbox = (e, id, result, type) => {
    const answer = HandleChange(id, result, type);

    let ans = anwsers.filter((data) => data.id !== id);
    setAnwsers([...ans, answer]);

    let checkedResult = { id, [result]: e.target.checked };

    setIsChecked({
      ...isChecked,
      ...checkedResult,
    });
  };

  function isCheckedbox(result) {
    let checked = false;

    if (isChecked && isChecked[result]) {
      checked = isChecked[result];
    }

    return checked;
  }

  const finishQuiz = async () => {
    setTimer(0);

    let score = 0;
    if (anwsers.length) {
      const resultAll = [...anwsers];
      const response = await axios.post(
        "http://localhost:4000/api/quiz/submit",
        resultAll
      );
      score = response.data.score;
    }

    setScores(() => score);
    setQuiz({});
    setIsFinish(true);
  };

  const TimerCountdown = () => {
    useEffect(() => {
      let interval = null;
      if (timer === null) {
        setIsFinish(false);
      } else if (timer > 0) {
        interval = setInterval(() => {
          setTimer((timer) => timer - 1);
        }, 1000);
      } else {
        clearInterval(interval);
        finishQuiz();
      }

      return () => clearInterval(interval);
    }, [timer]);

    return (
      <span>{isFinish || timer === null ? `` : `Time left: ${timer}`}</span>
    );
  };

  const [checkedBoxResult, setCheckedBoxResult] = useState([]);
  const checkedId = useRef(null);

  function HandleChange(id, val, type) {
    let ansQuiz = anwsers && anwsers.filter((a) => a.id === id);
    checked = ansQuiz.length > 0 ? ansQuiz[0].answer : [];

    if (checked.length > 0) {
      if (checked.includes(val)) {
        checked = checked.filter((item) => {
          return item !== val;
        });
      } else {
        checked = [...checked, val];
      }
    } else {
      checked = [val];
    }

    return { id, answer: checked, type };
  }

  // useEffect(() => {
  //   let result = { id: checkedId.current, answer: checked };
  //   console.log("id", checkedId.current);
  //   setCheckedBoxResult([result]);
  // }, [checked]);

  let disabledButton =
    quiz && quiz.type === "multiple" ? false : !isSelect ? true : false;

  return (
    <>
      <Container>
        <div>{/* User <span className="material-icons">face</span> */}</div>
        {quiz && (
          <div>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
              className=""
            >
              <Grid item xs={12} sm={6}>
                <div className="quiz-title">
                  {!isFinish &&
                    allQuestion.length > 0 &&
                    `Q. ${quiz.id} ${`/`} ${allQuestion.length}`}
                </div>
              </Grid>
              <Grid item xs={12} sm={6} className="text-right text-choice">
                <div>
                  {!isFinish && <TimerIcon className="timer-ic" />}
                  {TimerCountdown()}
                </div>
              </Grid>
            </Grid>
            <h3>{quiz.question}</h3>
            {quiz.type === "single" ? (
              quiz.choices &&
              quiz.choices.map((d, i) => {
                return (
                  <>
                    <div
                      key={i}
                      onClick={() => selectAnswer(quiz.id, d.id, quiz.type)}
                      className={`${
                        isSelect === d.id ? "select" : ""
                      } choice-single text-choice`}
                    >
                      {alphabet[i]}. {d.text}
                    </div>
                  </>
                );
              })
            ) : quiz.type === "multiple" ? (
              quiz.choices &&
              quiz.choices.map((d, i) => {
                return (
                  <div>
                    <Checkbox
                      key={i}
                      onChange={(e) =>
                        selectAnswerCheckbox(e, quiz.id, d.id, quiz.type)
                      }
                      inputProps={{
                        "aria-label": "primary checkbox",
                      }}
                      color="primary"
                      value={d.text}
                      ref={checkedId}
                      checked={isCheckedbox(d.id)}
                      className="checkbox-multi text"
                    />
                    {d.text}
                  </div>
                );
              })
            ) : (
              <></>
            )}

            <div className="wrap-button">
              <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
                spacing={3}
              >
                {!isFinish && currentQuestion > 1 && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      onClick={() => setPrevQuestion(currentQuestion)}
                      className="button"
                    >
                      <ChevronLeftIcon />
                      prev
                    </Button>
                  </Grid>
                )}
                {!isFinish ? (
                  currentQuestion === allQuestion.length ? (
                    <Grid item xs={12} sm={6} className="text-right">
                      <Button
                        variant="contained"
                        onClick={() => finishQuiz()}
                        disabled={disabledButton}
                        className={`button ${
                          disabledButton ? `` : `button-finish`
                        }`}
                      >
                        finish
                      </Button>
                    </Grid>
                  ) : (
                    <Grid
                      item
                      xs={12}
                      sm={currentQuestion === 1 ? 12 : 6}
                      className="text-right"
                    >
                      <Button
                        variant="contained"
                        onClick={() => setNextQuestion(currentQuestion)}
                        disabled={disabledButton}
                        className="button"
                      >
                        next
                        <ChevronRightIcon />
                      </Button>
                    </Grid>
                  )
                ) : (
                  <div></div>
                )}
              </Grid>
            </div>
          </div>
        )}
        {isFinish && (
          <div className="text-center">
            Your scores {scores} / {allQuestion.length}
          </div>
        )}
      </Container>
    </>
  );
}

export { Quiz };
