import React, { createContext, useState } from "react";
import Register from "./Register";
import Login from "./Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LayoutLogin() {
  return (
    <>
      <Register />
      <Login />
    </>
  );
}

export default LayoutLogin;
