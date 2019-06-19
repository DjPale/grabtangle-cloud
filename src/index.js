import './index.css';
import 'bootswatch/dist/darkly/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import FirebaseStore, { FirebaseContext, FirebaseMock } from './components/Firebase';

import App from './App';

ReactDOM.render(
    // Not a very elegant way of handling conditional mocking (via .env) - but could not find another obvious way...
    // Note that the dev server needs to be restarted when developing!
    <FirebaseContext.Provider value={process.env.REACT_APP_MOCK ? new FirebaseMock() : new FirebaseStore()}>
        <FirebaseContext.Consumer>
            {firebase => <App firebase={firebase} />}
        </FirebaseContext.Consumer>
    </FirebaseContext.Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
