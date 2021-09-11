import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";


const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "space-messengers.firebaseapp.com",
  projectId: "space-messengers",
  storageBucket: "space-messengers.appspot.com",
  messagingSenderId: "***REMOVED***",
  appId: "1:***REMOVED***:web:53b5214e4cfbd0cd5f969d"
};





firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth;
export const db = firebase.firestore();

export const storageRef = firebase.storage().ref();
