import React, { Component } from "react";
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect
} from "react-router-dom";
import Home from "./pages/Home";
// import {ChatFullpage} from "./pages/Chat";

import Login from "./pages/Login";
import CompleteRegistration from "./pages/CompleteRegistration";
import { auth } from "./services/firebase";
import Header from "./components/Header";
import Board from "./pages/Board";
import Gallery from "./pages/Gallery";
import RealtimeChat from "./pages/RealtimeChat";
import RealtimeChatAdmin from "./pages/RealtimeChatAdmin";
import './css/styles.css';

import { checkCurrentUserDbData } from "./helpers/userManagement"


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
            <Redirect to="/board" />
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
      if ( user ) {
        this.setState({
          authenticated: true,
          loading: false
        });
        checkCurrentUserDbData();
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
            <Route exact path="/" component={this.state.authenticated?Board:Home} />
            <Route path="/completeRegistration" component={CompleteRegistration} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/realtimechat" component={RealtimeChat} />
            <Route path="/realtimechatadmin" component={RealtimeChatAdmin} />

            <PrivateRoute
              path="/board"
              authenticated={this.state.authenticated}
              component={Board}
            />
            <PublicRoute
              path="/login"
              authenticated={this.state.authenticated}
              component={Login}
            />
            
          </Switch>
        </Router>
      );
  }
}

export default App;
