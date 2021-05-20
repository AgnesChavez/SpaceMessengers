import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
const config = {
  apiKey: "",
  authDomain: "space-messengers.firebaseapp.com",
  projectId: "space-messengers",
  storageBucket: "space-messengers.appspot.com",
  messagingSenderId: "",
  appId: ""
};

firebase.initializeApp(config);

export const auth = firebase.auth;
export const db = firebase.firestore();

export const storageRef = firebase.storage().ref();
