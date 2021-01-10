import React, { useState, useEffect } from "react";
import axios from "axios";

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
      const response = await axios.get("http://localhost:4000/api/quiz");
      setAllQuestion(response.data);
      let displayQuestion = response.data.filter(
        (d) => d.id == currentQuestion
      );
      setQuiz(() => displayQuestion[0]);
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
    let answer = { id, answer: result };
    let ans = anwsers.filter((data) => data.id !== id);
    setIsSelect(result);
    setAnwsers([...ans, answer]);
  }

  const finishQuiz = async () => {
    setTimer(0);

    const response = await axios.post(
      "http://localhost:4000/api/quiz/submit",
      anwsers
    );
    let score = response.data.score;

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

  return (
    <>
      {quiz && (
        <div>
          <h1>{!isFinish && `${quiz.id} ${`/`} ${allQuestion.length}`}</h1>
          {TimerCountdown()}
          <h2>{quiz.question}</h2>
          {quiz.choices &&
            quiz.choices.map((d, i) => (
              <div
                key={i}
                onClick={() => selectAnswer(quiz.id, d.id)}
                className={isSelect === d.id ? "select" : ""}
              >
                {alphabet[i]}. {d.text}
              </div>
            ))}

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
