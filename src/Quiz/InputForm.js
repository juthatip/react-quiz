import React, { useState } from "react";
import Checkbox from "@material-ui/core/Checkbox";

export function InputForm(props) {
  const [ans, setAns] = useState("");

  const handleSubmit = (evt) => {
    evt.preventDefault();
    console.log("oh ans", ans);
  };

  return (
    <input type="text" value={ans} onChange={(e) => setAns(e.target.value)} />
  );
}
