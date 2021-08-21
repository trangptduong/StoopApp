import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import registerPhoto from "./welcome.svg";

export default function Register({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const history = useHistory();

  const onRegisterPress = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    axios
      .post("/api/register", {
        email,
        password,
      })
      .then((response) => {
        setToken(response.data);
        toast.success("Your account was created successfully!");
        history.push("/login");
      })
      .catch((error) =>
        toast.error(
          error.response
            ? error.response.data
            : "Some error has been occured. Please try again."
        )
      );
  };

  return (
    <div className="container">
      <div className="form-box">
        <div className="header">Register</div>
        <div className="content text-center">
          <div className="image py-2">
            <img src={registerPhoto} style={{ width: "10em" }} />
          </div>
        </div>
        <div className="body-form">
          <form onSubmit={onRegisterPress}>
            <div className="input-group my-4">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fa fa-envelope"></i>
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="input-group mb-4">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fa fa-lock"></i>
                </span>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="input-group mb-4">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fa fa-lock"></i>
                </span>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            <button className="btn btn-success btn-block my-4">Register</button>
          </form>
          <div className="notRegistered text-center">
            <span>Already have an account? </span>
            <a href="/login">Login here</a>
          </div>
        </div>
      </div>
    </div>
  );
}
