import { render } from "preact";
import "./index.css";
import { App } from "./app.tsx";
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";

render(<App />, document.getElementById("app")!);
