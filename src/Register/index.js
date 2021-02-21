import React, { useState } from "react";
import { TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
  margin: {
    margin: theme.spacing(1),
    width: "100%",
  },
}));

export default function Register() {
  const classes = useStyles();
  const [email, setEmail] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [errorSubmit, setErrorSubmit] = useState(false);

  let history = useHistory();

  const handleSubmit = async () => {
    console.log("email", email);
    console.log("firstName", firstName);
    console.log("lastName", lastName);

    if (!email || !firstName || !lastName) {
      setErrorSubmit(true);
    } else {
      setErrorSubmit(false);
    }

    if (email && firstName && lastName) {
      const registerData = {
        email,
        firstName,
        lastName,
      };
      const response = await axios.post(
        "http://localhost:4000/api/user/register",
        registerData
      );

      if (response.data) {
        console.log(response.data);

        // history.goBack();
      } else {
        setErrorSubmit(true);
      }
    }
  };

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <div className="input-field">
        <div className="text-center h-title">Register</div>
        <div>
          <TextField
            id="standard-name"
            label="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            helperText={!email && errorSubmit ? "Please fill your email" : ""}
            type="email"
          />
        </div>
        <div>
          <TextField
            id="standard-name"
            label="Firstname"
            onChange={(e) => setFirstName(e.target.value)}
            className="input-field"
            helperText={
              !firstName && errorSubmit ? "Please fill your Firstname" : ""
            }
          />
        </div>
        <div>
          <TextField
            id="standard-name"
            label="Lastname"
            onChange={(e) => setLastName(e.target.value)}
            className="input-field"
            helperText={
              !lastName && errorSubmit ? "Please fill your Lastname" : ""
            }
          />
        </div>
        <div className="text-center my-2 button-submit">
          <Button
            variant="contained"
            onClick={handleSubmit}
            className={classes.margin}
          >
            Submit
          </Button>
          {errorSubmit ? "Please try again" : ""}
        </div>
      </div>
    </form>
  );
}
