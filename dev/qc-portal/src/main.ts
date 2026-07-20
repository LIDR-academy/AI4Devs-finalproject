import "./styles/app.css";
import { mountApp } from "./app";

/** Entry point: mount the app into #app. Fail fast if the root is missing. */
const root = document.getElementById("app");
if (root === null) {
  throw new Error("Root element #app not found in index.html");
}
mountApp(root);
