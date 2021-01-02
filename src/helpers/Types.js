import firebase from 'firebase/app';

import { getRandomInt } from './utils.js';


export function userTypes() {
  return {
    student: "student",
    instructor: "instructor",
    admin: "admin"
  }
}


export function Color(r=255, g=255, b=255, a=1){
  return {r, g, b, a};
}


// export function randomColor()
// {
//   return Color(getRandomInt(0,255), getRandomInt(200,255), getRandomInt(0,255), 1);
// }
export function randomColorHSL(){
  return "hsl("+ getRandomInt(0,360) + ", " + getRandomInt(90,100) + "%, 50%)" 
}

export function WorkshopData(name) {
  return {
    id: "",
    instructors: [],
    institutions: [],
    students: [],
    name: name,
    date: firebase.firestore.FieldValue.serverTimestamp(),
    created: firebase.firestore.FieldValue.serverTimestamp(),
  }
}


export function TeamData(workshopId, membersArray) {
  return {
    id: "",
    name:"",
    workshopId,
    members: Array.isArray(membersArray)?membersArray:[],
    created: firebase.firestore.FieldValue.serverTimestamp(),
  }
}


export function UserData(uid, name, type, institutionId) {
  // console.log("UserData: ", uid, name, type, institutionId);
  return {
    id: uid,
    type: type,
    location: "",
    bio: "",
    institutionId: institutionId,
    teamsMap: null,
    photoURL: null,
    displayName: name,
    color: randomColorHSL(),
    partnerId:"",
    created: firebase.firestore.FieldValue.serverTimestamp(),
  };
}
export function BoardData(teamId, name) {
  return {
    id: "",
    messages: [],
    teamId,
    name,
    created: firebase.firestore.FieldValue.serverTimestamp(),
  }
}

export function InstitutionData(name) {
  return {
    name,
    color: randomColorHSL(),
    created: firebase.firestore.FieldValue.serverTimestamp(),
  };
}

export function BoardMessageData(uid, boardId) {
  return {
    content: "",
    created: firebase.firestore.FieldValue.serverTimestamp(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    uid,
    id: null,
    boardId,
    position: {
      x: 0,
      y: 0
    },
    comments:{}
  };
}