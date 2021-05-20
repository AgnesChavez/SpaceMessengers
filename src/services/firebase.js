import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
const config = {
apiKey: "***REMOVED***",
  authDomain: "space-messengers.firebaseapp.com",
  projectId: "space-messengers",
  storageBucket: "space-messengers.appspot.com",
  messagingSenderId: "***REMOVED***",
  appId: "1:***REMOVED***:web:***REMOVED***"
};

firebase.initializeApp(config);

export const auth = firebase.auth;
export const db = firebase.firestore();

export const storageRef = firebase.storage().ref();
