import React, { Component } from 'react';
import './app.css';
import './components/styles/container.css';
import './components/styles/btnGradient.css';
import './components/styles/modal.css';
import {
  Route, Link, Redirect, Switch, BrowserRouter as Router
} from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { Provider } from 'react-redux';
import store from './store';
import Login from './components/auth/Login';
import Screen from './components/screen/Screen';
import Waiter from './components/waiter/Waiter';
import Table from './components/waiter/table/Table';
import Menu from './components/waiter/menu/Menu';
import Categories from './components/waiter/categories/Categories';
import Finalize from './components/waiter/finalize/Finalize';
import setAuthToken from './utils/setAuthToken';
import { logoutUser, setCurrentUser } from './actions/authActions';

const Public = () => <div> This is a public page </div>;

const Private = () => <div> This is a private page </div>;

// Check for token
if (localStorage.jwtToken) {
  // Set Auth token
  setAuthToken(localStorage.jwtToken);
  // Decode token and get user info
  const decoded = jwt_decode(localStorage.jwtToken);
  // Set user and is Authenticated
  store.dispatch(setCurrentUser(decoded));

  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    // logout user
    store.dispatch(logoutUser());

    // Redirect to login
    window.location.href = '/';
  }
}

// eslint-disable-next-line react/prefer-stateless-function
export default class App extends Component {
  constructor() {
    super();
    this.state = {
      authstate: false
    };
  }

  componentDidMount() {
    if (localStorage.jwtToken) {
      this.setState({ authstate: true });
    } else {
      this.setState({ authstate: false });
    }
  }

  render() {
    return (
      <Provider store={store}>
        <Router>
          <Switch>
            <Route exact path="/" component={Login} />
            <Route path="/public" component={Public} />
            <Route path="/private" component={Private} />
            <Route path="/screen" component={Screen} />
            <Route path="/waiter" component={Waiter} />
            <Route path="/table" component={Table} />
            <Route path="/menu" component={Menu} />
            <Route path="/categories" component={Categories} />
            <Route path="/finalize" component={Finalize} />
          </Switch>
        </Router>
      </Provider>
    );
  }
}
