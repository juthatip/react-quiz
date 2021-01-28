import React, { useState } from "react";
import Checkbox from "@material-ui/core/Checkbox";

export default function Checkboxes(props) {
  const { value, checked } = props;
  // const [checked, setChecked] = useState(true);

  // const handleChange = (event) => {
  //   setChecked(event.target.checked);
  // };

  console.log("checke", checked);

  return (
    <div>
      <Checkbox
        checked={checked}
        // onChange={() => handleChange(event.target.checked)}
        inputProps={{ "aria-label": "primary checkbox" }}
        color="primary"
        value={value}
      />
      {value}
    </div>
  );
}
