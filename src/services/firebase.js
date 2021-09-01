import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmMvwVbcCjRckVFKsFhdE-jVUVUP_1Zao",
  authDomain: "space-messengers.firebaseapp.com",
  projectId: "space-messengers",
  storageBucket: "space-messengers.appspot.com",
  messagingSenderId: "***REMOVED***",
  appId: "1:***REMOVED***:web:315bc715749b60915f969d"
};
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth;
export const db = firebase.firestore();

export const storageRef = firebase.storage().ref();
