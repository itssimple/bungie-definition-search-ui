import "./app.css";
import Router, { Route } from "preact-router";
import { Home } from "./pages/home";
import { Destiny1SearchGUI } from "./pages/destiny1";
import { Destiny2SearchGUI } from "./pages/destiny2";

export function App() {
    return (
        <Router>
            <Route path="/" component={Home} />
            <Route path="/destiny1/:pgcrId" component={Destiny1SearchGUI} />
            <Route path="/destiny2/:pgcrId" component={Destiny2SearchGUI} />
            <Route default component={Home} />
        </Router>
    );
}
