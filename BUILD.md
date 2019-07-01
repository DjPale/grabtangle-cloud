# Build Instructions

In order to run an actual using Firebase, there are some additional steps needed. Note that the application can run with a simple mocked backend as well - this only requires some setup in the environment file and additional package.

## Common mandatory packages

The following packages needs to be installed globally with `npm install -g <package-name>`

* [cross-env](https://www.npmjs.com/package/cross-env)

## Environment file

In order to setup parameters for the application and firebase, create a file in the root directory called of the application folder called `.env`.

Note that any changes done to this file requires a restart of the local development server if you are currently development.

### Mock only - no firebase backend
In order to run a mocked backend without any connection to firebase, please specify the following in the `.env`-file.
```
REACT_APP_MOCK=true
```

Setting it to anything else will start the firebase backend. (Note that it uses a string comparison, not boolean).

### Firebase parameters

In order to connect to an actual firebase instance, some additional environment variables are needed. Setting up a firebase project is described other places and is beyond scope of this description. At minimum you should have created a Web Application.

To extract the parameters, locate your Web App JSON-config which will look something like this:
```
const firebaseConfig = {
  apiKey: "averylongstring",
  authDomain: "appdomain.firebaseapp.com",
  databaseURL: "https://app.firebaseio.com",
  projectId: "yourproject",
  storageBucket: "yourproject.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:123123:web:456456"
};
```

Add the following parameters to the `.env`-file where the value is the actual value given by the key in your own config:

```
REACT_APP_API_KEY=apiKey
REACT_APP_AUTH_DOMAIN=authDomain
REACT_APP_AUTH_DATABASE_URL=databaseURL
REACT_APP_PROJECT_ID=projectId
REACT_APP_STORAGE_BUCKET=storageBucket
REACT_APP_MESSAGING_SENDER_ID=messagingSenderId
REACT_APP_APP_ID=appId
``` 

## Firebase deploy

In order to enable to deploy automatically to firebase, you need to install the following pacakges with `npm install -g <package-name>`

* [firebase-tools](https://www.npmjs.com/package/firebase-tools)

You should probably re-initialize the settings for firebase to match your config by running `firebase login` and `firebase init`.

For a good description of this setup, please see the following [tutorial](https://www.robinwieruch.de/firebase-deploy-react-js/).