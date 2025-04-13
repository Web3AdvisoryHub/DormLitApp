import { createRoot } from "react-dom/client";
import { Helmet } from "react-helmet";
import App from "./App";
import "./index.css";

// Add react-helmet to handle head metadata
createRoot(document.getElementById("root")!).render(
  <>
    <Helmet>
      <meta name="theme-color" content="#6A0DAD" />
      <meta name="description" content="Dormlit Official - Your cosmic digital fan haven where creativity and community converge." />
    </Helmet>
    <App />
  </>
);
