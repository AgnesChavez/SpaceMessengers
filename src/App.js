import React, { Component } from "react";
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect
} from "react-router-dom";
import Home from "./pages/Home";
import {ChatFullpage} from "./pages/Chat";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import UserProfile from "./pages/User";
import Settings from "./pages/Settings";
import CompleteRegistration from "./pages/CompleteRegistration";
import { auth } from "./services/firebase";
import Header from "./components/Header";
import Board from "./pages/Board";
import './styles.css';

function PrivateRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        authenticated === true ? (
          <Component {...props} />
        ) : (
            <Redirect
              to={{ pathname: "/login", state: { from: props.location } }}
            />
          )
      }
    />
  );
}

function PublicRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        authenticated === false ? (
          <Component {...props} />
        ) : (
            <Redirect to="/chat" />
          )
      }
    />
  );
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
      loading: true
    };
  }

  componentDidMount() {
    auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({
          authenticated: true,
          loading: false
        });
      } else {
        this.setState({
          authenticated: false,
          loading: false
        });
      }
    });
  }

  render() {
    return this.state.loading === true ? (
      <div className="spinner-border text-success" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    ) : (
        <Router>
          <Header />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/completeRegistration" component={CompleteRegistration} />
            <PrivateRoute
              path="/chat"
              authenticated={this.state.authenticated}
              component={ChatFullpage}
            />
            <PrivateRoute
              path="/board"
              authenticated={this.state.authenticated}
              component={Board}
            />
            <PrivateRoute
              path="/profile"
              authenticated={this.state.authenticated}
              component={UserProfile}
            />
            <PublicRoute
              path="/signup"
              authenticated={this.state.authenticated}
              component={Signup}
            />
            <PublicRoute
              path="/login"
              authenticated={this.state.authenticated}
              component={Login}
            />
            <PrivateRoute
              path="/settings"
              authenticated={this.state.authenticated}
              component={Settings}
            />
            
          </Switch>
        </Router>
      );
  }
}

export default App;
