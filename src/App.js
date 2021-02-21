import "./App.css";
import { Route, Switch } from "react-router-dom";
import { Quiz } from "./Quiz";
import Register from "./Register";

const Home = () => <h1>Home</h1>;
const QuizComponent = () => <Quiz />;

function App() {
  return (
    <div>
      <div className="App-header">
        <Switch>
          <Route path="/register" component={Register} />
          <Route path="/quiz/:id" component={QuizComponent} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
