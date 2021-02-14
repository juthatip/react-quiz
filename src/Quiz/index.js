import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// import Checkboxes from "./Checkbox";
import Checkbox from "@material-ui/core/Checkbox";

let checked = [];

function Quiz() {
  const [allQuestion, setAllQuestion] = useState([]);
  const [quiz, setQuiz] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [scores, setScores] = useState(0);
  const [timer, setTimer] = useState(10);
  const [isFinish, setIsFinish] = useState(false);
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  // const [checkedTest, setChecked] = useState([]);

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
    setTimer(10);

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

    const resultAll = [...anwsers];

    let score = 0;
    if (resultAll.length) {
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
      if (timer > 0) {
        interval = setInterval(() => {
          setTimer((timer) => timer - 1);
        }, 1000);
      } else {
        clearInterval(interval);
        finishQuiz();
      }

      return () => clearInterval(interval);
    }, [timer]);

    return <div>{isFinish ? `` : `Time left: ${timer}`} </div>;
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
      {quiz && (
        <div>
          <h1>
            {!isFinish &&
              allQuestion.length > 0 &&
              `Q. ${quiz.id} ${`/`} ${allQuestion.length}`}
          </h1>
          {TimerCountdown()}
          <h2>{quiz.question}</h2>
          {quiz.type === "single" ? (
            quiz.choices &&
            quiz.choices.map((d, i) => {
              return (
                <>
                  <div
                    key={i}
                    onClick={() => selectAnswer(quiz.id, d.id, quiz.type)}
                    className={isSelect === d.id ? "select" : ""}
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
                <>
                  <Checkbox
                    key={i}
                    onChange={(e) =>
                      selectAnswerCheckbox(e, quiz.id, d.id, quiz.type)
                    }
                    inputProps={{ "aria-label": "primary checkbox" }}
                    color="primary"
                    value={d.text}
                    ref={checkedId}
                    checked={isCheckedbox(d.id)}
                  />
                  {d.text}
                </>
              );
            })
          ) : (
            <></>
          )}

          {!isFinish && currentQuestion > 1 && (
            <button onClick={() => setPrevQuestion(currentQuestion)}>
              prev
            </button>
          )}
          {!isFinish ? (
            currentQuestion === allQuestion.length ? (
              <button onClick={() => finishQuiz()} disabled={disabledButton}>
                finish
              </button>
            ) : (
              <button
                onClick={() => setNextQuestion(currentQuestion)}
                disabled={disabledButton}
              >
                next
              </button>
            )
          ) : (
            <div></div>
          )}
        </div>
      )}
      {isFinish && (
        <div>
          Your scores: {scores} out of {allQuestion.length}
        </div>
      )}
    </>
  );
}

export { Quiz };
