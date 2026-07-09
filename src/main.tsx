import { render } from "preact";
import "./styles/destiny-ui/fonts/fonts.css";
import "./styles/destiny-ui/destiny2-full-framework.css";
import "./index.css";
import { App } from "./app.tsx";

render(<App />, document.getElementById("app")!);
