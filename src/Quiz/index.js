import React, { useState, useEffect } from "react";
import axios from "axios";

function fetchData() {
  const quiz = [
    {
      id: 1,
      question: "What is 2 + 2 ",
      answers: { a: "4", b: "3", c: "22", d: "5" },
    },
    {
      id: 2,
      question: "2",
      answers: { a: "4", b: "3", c: "22", d: "5" },
    },
    {
      id: 3,
      question: "3",
      answers: { a: "4", b: "3", c: "22", d: "5" },
    },
    {
      id: 4,
      question: "4",
      answers: { a: "4", b: "3", c: "22", d: "5" },
    },
    {
      id: 5,
      question: "5",
      answers: { a: "4", b: "3", c: "22", d: "5" },
    },
  ];

  //console.log("oh quiz", testQuiz);

  return quiz;
}

let currentQuestion = 1;

function Quiz() {
  const allQuestion = fetchData();
  const [testallQuestion, setAllQuestion] = useState([]);
  useEffect(() => {
    const testQuiz = async () => {
      const response = await axios.get("http://localhost:4000/api/quiz");
      console.log("response", response.data);
      setAllQuestion(response.data);
    };
    testQuiz();
  }, []);

  // const [currentQuestion, setCurrentQuestion] = useState(1)

  console.log("test", testallQuestion);
  let displayQuestion = allQuestion.filter((d) => d.id == currentQuestion);
  const [quiz, setQuiz] = useState(() => displayQuestion[0]);
  const [anwsers, setAnwsers] = useState(() => []);
  const [isSelect, setIsSelect] = useState(() => "");

  function setNextQuestion() {
    currentQuestion++;
    displayQuestion = allQuestion.filter((d) => d.id == currentQuestion);
    let ansQuiz = anwsers.filter((a) => a.id == currentQuestion);
    let isSelectAns = ansQuiz.length > 0 ? ansQuiz[0].answer : "";

    setQuiz(() => displayQuestion[0]);
    setIsSelect(() => isSelectAns);
  }

  function setPrevQuestion() {
    currentQuestion--;
    displayQuestion = allQuestion.filter((d) => d.id == currentQuestion);
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

  function getAllAns() {
    return { 1: "4", 2: "22", 3: "3", 4: "dfv", 5: "sdfd" };
  }

  function finishQuiz() {
    let allAns = getAllAns();
    console.log("1", allAns);
    console.log("2", anwsers);
    let scores = 0;
    anwsers.forEach((data) => {
      const ans = allAns[data.id];
      if (ans === data.answer) {
        scores += 1;
      }
    });

    console.log("score", scores);
  }

  return (
    <>
      {quiz && (
        <div>
          <h1>{/* {quiz.id}/{allQuestion.length} */}</h1>
          <h2>{quiz.question}</h2>
          {Object.keys(quiz.answers).map((d, i) => (
            <div
              key={i}
              onClick={() => selectAnswer(quiz.id, quiz.answers[d], i)}
              className={isSelect === quiz.answers[d] ? "select" : ""}
            >
              {d}.{quiz.answers[d]}
            </div>
          ))}
          {currentQuestion > 1 && (
            <button onClick={setPrevQuestion}>prev</button>
          )}
          {currentQuestion === allQuestion.length ? (
            <button onClick={finishQuiz} disabled={!isSelect ? true : false}>
              finish
            </button>
          ) : (
            <button
              onClick={setNextQuestion}
              disabled={!isSelect ? true : false}
            >
              next
            </button>
          )}
        </div>
      )}
    </>
  );
}

export { Quiz };
