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

  const validateForm = (label, val) => {
    let isValid = true;
    let text = "";

    if (!val) {
      isValid = false;
      text = `Required ${label}`;
    } else if (val.length < 2) {
      isValid = false;
      text = `Invalid ${label}`;
    } else if (label === "Email") {
      if (!validateEmail(val)) {
        isValid = false;
        text = `${val} is not valid`;
      }
    }

    return { isValid, text };
  };

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const handleSubmit = async () => {
    let isEmailValid = validateForm("Email", email).isValid;
    let isFirstNameValid = validateForm("Firstname", firstName).isValid;
    let isLastNameValid = validateForm("Lastname", lastName).isValid;
    if (isEmailValid && isFirstNameValid && isLastNameValid) {
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
        if (response.data.errors) {
          setErrorSubmit(true);
        } else {
          setErrorSubmit(false);
          let result = response.data;
          if (result.id) {
            const userData = {
              id: result.id,
              firstName: result.firstName,
            };
            localStorage.setItem("userData", JSON.stringify(userData));
            history.goBack();
          }
          //{"id":2,"email":"aa@aa.com","firstName":"dfdfdf","lastName":"test","updatedAt":"2021-02-21T18:03:54.797Z","createdAt":"2021-02-21T18:03:54.797Z"}
        }
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
            helperText={validateForm("Email", email).text}
            type="email"
          />
        </div>
        <div>
          <TextField
            id="standard-name"
            label="Firstname"
            onChange={(e) => setFirstName(e.target.value)}
            className="input-field"
            helperText={validateForm("Firstname", firstName).text}
          />
        </div>
        <div>
          <TextField
            id="standard-name"
            label="Lastname"
            onChange={(e) => setLastName(e.target.value)}
            className="input-field"
            helperText={validateForm("Lastname", lastName).text}
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
          <div className="error-text">
            {errorSubmit ? "Someing went wrong. Please try again" : ""}
          </div>
        </div>
      </div>
    </form>
  );
}
