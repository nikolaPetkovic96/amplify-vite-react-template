import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from "@aws-amplify/ui-react";
import ProfilePicture2 from "./ProfilePicture2.tsx";

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(

  <React.StrictMode>
    <Authenticator>
      <ProfilePicture2 />
      <App />

    </Authenticator>
  </React.StrictMode>
);
