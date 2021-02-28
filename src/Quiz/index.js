import React, { useState, useEffect, useRef, Fragment } from "react";
import axios from "axios";
// import Checkboxes from "./Checkbox";
import { Container, Checkbox, Button, Grid } from "@material-ui/core";

import TimerIcon from "@material-ui/icons/Timer";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import FaceIcon from "@material-ui/icons/Face";
import { useParams, useHistory } from "react-router-dom";

let checked = [];

function Quiz() {
  const { id } = useParams();
  let history = useHistory();

  const [allQuestion, setAllQuestion] = useState([]);
  const [quiz, setQuiz] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [scores, setScores] = useState(0);
  const [timer, setTimer] = useState(null);
  const [isFinish, setIsFinish] = useState(false);
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const [topic, setTopic] = useState([]);
  const [userData, setUserData] = useState({});
  const [currentTopicId, setCurrentTopicId] = useState(id);
  const [anwsers, setAnwsers] = useState(() => []);

  useEffect(() => {
    const getUserData = getLocalStorageUser();

    const fetchData = async () => {
      const response = await axios.get(`http://localhost:4000/api/quiz/${id}`);
      setAllQuestion(response.data);
      if (response.data) {
        let currentQ = getUserData ? getUserData : currentQuestion;
        let displayQuestion = response.data.filter((d) => d.id === currentQ);
        setQuiz(() => displayQuestion[0]);
      }
    };

    fetchData();
    setCurrentTopicId(id);
  }, []);

  const getLocalStorageUser = () => {
    const getUserData = localStorage.getItem("userData");
    const userDataLocal = JSON.parse(getUserData);
    console.log("userDataLocal", userDataLocal);
    if (userDataLocal) {
      console.log("local", userDataLocal);
      setUserData(userDataLocal);
      if (
        userDataLocal.answers &&
        Object.keys(userDataLocal.answers).length !== 0
      ) {
        console.log("setAn", userDataLocal.answers);
        setAnwsers(userDataLocal.answers);

        const dataSort = userDataLocal.answers.sort((a, b) => {
          return b.id - a.id;
        });
        if (dataSort.length > 0) {
          let id = dataSort[0].id;
          setCurrentQuestion(id);
          let ansQuiz = userDataLocal.answers.filter((a) => a.id === id);
          let isSelectAns = ansQuiz.length > 0 ? ansQuiz[0].answer : "";
          setIsSelect(isSelectAns);
          if (ansQuiz.length > 0 && ansQuiz[0].type === "multiple") {
            let defaultAns = ansQuiz[0].answer.reduce((result, item, i) => {
              result[item] = true;
              return result;
            }, {});

            setIsChecked({
              ...defaultAns,
            });
          }

          return id;
        }
      }
      return "";
    } else {
      history.push("/register");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await axios.get("http://localhost:4000/api/topic/");
      if (response && response.data && currentTopicId) {
        let getTopic = response.data.filter(
          (d) => d.id === parseInt(currentTopicId)
        );
        if (getTopic.length) {
          setTopic(() => getTopic[0]);
          setTimer(getTopic[0].timer);
        }
      }
    };
    fetchUserData();
  }, []);

  const [isSelect, setIsSelect] = useState(() => "");
  const [isChecked, setIsChecked] = useState(() => {});

  function setNextQuestion(currentQuestion) {
    currentQuestion = currentQuestion + 1;
    updateAnswer(currentQuestion);

    const getAnwsers = {
      ...userData,
      answers: anwsers,
    };

    localStorage.setItem("userData", JSON.stringify(getAnwsers));
  }

  function setPrevQuestion(currentQuestion) {
    currentQuestion = currentQuestion - 1;
    updateAnswer(currentQuestion);
  }

  function updateAnswer(currentQuestion) {
    setCurrentQuestion(() => currentQuestion);
    let displayQuestion = allQuestion.filter((d) => d.id === currentQuestion);
    let ansQuiz = anwsers.filter((a) => a.id === currentQuestion);
    let isSelectAns = ansQuiz.length > 0 ? ansQuiz[0].answer : "";

    setQuiz(() => displayQuestion[0]);
    setIsSelect(isSelectAns);

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
    localStorage.removeItem("userData");
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

  let disabledButton =
    quiz && quiz.type === "multiple" ? false : !isSelect ? true : false;

  return (
    <>
      <Container>
        {quiz && Object.keys(quiz).length !== 0 ? (
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
                  {isFinish || timer === null ? (
                    ``
                  ) : (
                    <>
                      <TimerIcon className="timer-ic" />
                      Time : {timer}
                    </>
                  )}
                </div>
              </Grid>
            </Grid>
            <h3>{quiz.question}</h3>
            {quiz.type === "single" ? (
              quiz.choices &&
              quiz.choices.map((d, i) => {
                return (
                  <div key={i}>
                    <span
                      className={`${
                        isSelect === d.id ? "select" : ""
                      } choice-single text-choice`}
                      onClick={() => selectAnswer(quiz.id, d.id, quiz.type)}
                    >
                      {alphabet[i]}. {d.text}
                    </span>
                  </div>
                );
              })
            ) : quiz.type === "multiple" ? (
              quiz.choices &&
              quiz.choices.map((d, i) => {
                return (
                  <div key={i}>
                    <Checkbox
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
        ) : !allQuestion.length ? (
          <div className="text-center">
            <h2>{"Quiz not found"}</h2>
          </div>
        ) : (
          <Fragment />
        )}
        {isFinish && (
          <div className="text-center">
            <h2>
              Your scores {scores} / {allQuestion.length}{" "}
            </h2>
          </div>
        )}
      </Container>
    </>
  );
}

export { Quiz };
