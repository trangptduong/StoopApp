import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Switch, Link } from 'react-router-dom';
import { GuardProvider, GuardedRoute } from 'react-router-guards';
import { toast, ToastContainer } from "react-toastify";
import io from 'socket.io-client';

import Map from './HomeScreen';
import Login from "./Login";
import Register from "./Register";
import SettingScreen from "./Settings";
import NavBar from "./NavigationBar";

import './App.css';

let token = null;

const socket = io({
  autoConnect: false
});

const requireLogin = (to, from, next) => {
  if (to.meta.auth) {
    if (token != null) {
      next();
    }
    next.redirect('/login');
  } else {
    next();
  }
};

const subscribeToListingAlerts = () => {
  console.log("init sub");
  socket.on('broadcast_taken', function(data){
    console.log("checking if client subbed");
    socket.emit('client_taken', {'message': data.message, 'listingID': data.listingID});
  });
  socket.on('notify_client', function(data){
    console.log("client is subbed");
    toast.info(data.message);
  });
};

function emitTaken(id){
  console.log("Emitting set_taken");
  socket.emit("set_taken", {'listingID':id});
};

function App() {
  const [initialized, setInitialized] = useState(false);
  const rerender = useState(0)[1];

  function socketConn(mode) {
    if (mode == 'connect'){
      socket.connect();
    }
    else if (mode == 'disconnect'){
      socket.disconnect();
    }
  };

  function setToken(newToken) {
    token = newToken;
    rerender(Math.random());
  };

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      subscribeToListingAlerts();
    }
  });

  return (
    <Router>
      {/* <button onClick={testClick}>Test</button> */}
      <GuardProvider guards={[requireLogin]}>
        <Switch>
          <GuardedRoute path="/login">
            <Login socketConn={socketConn} setToken={setToken} logout={false}/>
          </GuardedRoute>
          <GuardedRoute path="/register">
            <Register setToken={setToken}/>
          </GuardedRoute>
          <GuardedRoute exact path="/" meta={{ auth: true }}>
            <Map emitTaken={emitTaken}/>
          </GuardedRoute>
          <GuardedRoute path="/settings" exact component={SettingScreen} meta={{ auth: true }} />
          <GuardedRoute path="/logout" meta={{ auth: true }}>
            <Login socketConn={socketConn} setToken={setToken} logout={true}/>
          </GuardedRoute>
        </Switch>
      </GuardProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={true}
      />
      {/* Navigation bar */}
      <NavBar />
    </Router>
  );
}

export default App;
