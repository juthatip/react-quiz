import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// import Checkboxes from "./Checkbox";
import Checkbox from "@material-ui/core/Checkbox";

function Quiz() {
  const [allQuestion, setAllQuestion] = useState([]);
  const [quiz, setQuiz] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [scores, setScores] = useState(0);
  const [timer, setTimer] = useState(10);
  const [isFinish, setIsFinish] = useState(false);
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("http://localhost:4000/api/quiz/1");
      setAllQuestion(response.data);
      if (response.data) {
        let displayQuestion = response.data.filter(
          (d) => d.id == currentQuestion
        );
        setQuiz(() => displayQuestion[0]);
      }
    };
    fetchData();
  }, []);

  const [anwsers, setAnwsers] = useState(() => []);
  const [isSelect, setIsSelect] = useState(() => "");

  function setNextQuestion(currentQuestion) {
    currentQuestion = currentQuestion + 1;
    setCurrentQuestion(() => currentQuestion);
    let displayQuestion = allQuestion.filter((d) => d.id == currentQuestion);
    let ansQuiz = anwsers.filter((a) => a.id == currentQuestion);
    let isSelectAns = ansQuiz.length > 0 ? ansQuiz[0].answer : "";

    setQuiz(() => displayQuestion[0]);
    setIsSelect(() => isSelectAns);
    setTimer(10);
  }

  function setPrevQuestion(currentQuestion) {
    currentQuestion = currentQuestion - 1;
    setCurrentQuestion(() => currentQuestion);
    let displayQuestion = allQuestion.filter((d) => d.id == currentQuestion);
    setQuiz(() => displayQuestion[0]);
    let ansQuiz = anwsers.filter((a) => a.id == currentQuestion);

    setIsSelect(ansQuiz[0].answer);
  }

  function selectAnswer(id, result) {
    console.log("selectAnswer---", result);
    let answer = { id, answer: result };
    let ans = anwsers.filter((data) => data.id !== id);
    setIsSelect(result);
    setAnwsers([...ans, answer]);
  }

  const finishQuiz = async () => {
    setTimer(0);

    const resultAll = [...anwsers, ...checkedBoxResult];

    console.log("oh", resultAll);
    console.log("oh anwsers", anwsers);
    console.log("oh checkedBoxResult", checkedBoxResult);

    // const response = await axios.post(
    //   "http://localhost:4000/api/quiz/submit",
    //   resultAll
    // );

    // console.log("..resultAll", resultAll);
    // let score = response.data.score;
    let score = 0;

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

  const [checked, setChecked] = useState([]);
  const [checkedBoxResult, setCheckedBoxResult] = useState([]);
  const checkedId = useRef(null);

  const HandleChange = (id, val) => {
    if (checked.length > 0) {
      if (checked.includes(val)) {
        const filteredItems = checked.filter((item) => {
          return item !== val;
        });
        setChecked(filteredItems);
      } else {
        setChecked([...checked, val]);
      }
    } else {
      setChecked([val]);
    }
    console.log("checkedId.current", checkedId.current);
    checkedId.current = id;

    // let result = { id, answer: checked };
    // console.log("id", checkedId.current);
    // setCheckedBoxResult([result]);
  };

  // useEffect(() => {
  //   let result = { id: checkedId.current, answer: checked };
  //   console.log("id", checkedId.current);
  //   setCheckedBoxResult([result]);
  // }, [checked]);

  const mock = [
    {
      id: "1111",
      question: "This is a test check box",
      choices: [
        { id: 1, text: "checkbox 1" },
        { id: 2, text: "checkbox 2" },
        { id: 3, text: "checkbox 3" },
        { id: 4, text: "checkbox 4" },
      ],
    },
  ];

  // console.log("checked 2", checked);

  return (
    <>
      {quiz && (
        <div>
          <h1>{!isFinish && `${quiz.id} ${`/`} ${allQuestion.length}`}</h1>
          {TimerCountdown()}
          <h2>{quiz.question}</h2>
          {quiz.type === "single" ? (
            quiz.choices &&
            quiz.choices.map((d, i) => {
              return (
                <>
                  <div
                    key={i}
                    onClick={() => selectAnswer(quiz.id, d.id)}
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
                    onClick={(e) => selectAnswer(quiz.id, d.id)}
                    inputProps={{ "aria-label": "primary checkbox" }}
                    color="primary"
                    value={d.text}
                    ref={checkedId}
                  />
                  {d.text}
                </>
              );
            })
          ) : (
            <>{"no type"}</>
          )}

          {!isFinish && currentQuestion > 1 && (
            <button onClick={() => setPrevQuestion(currentQuestion)}>
              prev
            </button>
          )}
          {!isFinish ? (
            currentQuestion === allQuestion.length ? (
              <button
                onClick={() => finishQuiz()}
                disabled={!isSelect ? true : false}
              >
                finish
              </button>
            ) : (
              <button
                onClick={() => setNextQuestion(currentQuestion)}
                disabled={!isSelect ? true : false}
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
