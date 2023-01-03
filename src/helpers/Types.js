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

export function randomColorHSL(){
  return "hsl("+ getRandomInt(0,360) + ", " + getRandomInt(90,100) + "%, 50%)" 
}

export function WorkshopData(name) {
  return {
    id: "",
    instructors: [],
    institutions: [],    
    name: name,
    date: firebase.firestore.FieldValue.serverTimestamp(),
    created: firebase.firestore.FieldValue.serverTimestamp(),
  }
}


export function TeamData(name, workshopId) {
  return {
    id: "",
    name,
    workshopId,
    members: [],
    created: firebase.firestore.FieldValue.serverTimestamp(),
  }
}


export function UserData(uid, data, type, institutionId, workshopId) {
  // console.log("UserData: ", uid, data, type, institutionId);
  let u ={
    id: uid,
    type: type,
    location: "",
    bio: "",
    institutionId: institutionId,
    photoURL: null,
    displayName: "" ,
    color: randomColorHSL(),
    boards: [],
    currentBoard: null,
    workshopCurrentBoard: {},
    currentTeam: null,
    currentWorkshop: workshopId,
    created: firebase.firestore.FieldValue.serverTimestamp(),
  };
  if(data.name) u.displayName = data.name;
  if(data.email) u.email = data.email.trim().toLowerCase();
  if(data.team){
    u.team = data.team; 
    u.currentTeam = data.team;
  }

  return u;


}

export function BoardData(teamId, name) {
  return {
    id: "",
    messages: [],
    teamId,
    name,
    color: randomColorHSL(),
    created: firebase.firestore.FieldValue.serverTimestamp(),
  }
}

export function InstitutionData(name, location) {
  return {
    name,
    color: randomColorHSL(),
    location,
    created: firebase.firestore.FieldValue.serverTimestamp(),
  };
}

export function BoardMessageData(uid, boardId, x, y) {
  return {
    content: "",
    created: firebase.firestore.FieldValue.serverTimestamp(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    isImage: false,
    imgURL: null,
    uploadPath: null,
    uid,
    color: randomColorHSL(),
    id: null,
    boardId,
    isShowing: false,
    position: {
      x,
      y
    },
    comments:{}
  };
}
export function ImageData(uid, workshopId, thumbURL, downloadURL, caption, imagePath) {
  return {
    created: firebase.firestore.FieldValue.serverTimestamp(),
    id: null,
    uid, workshopId, downloadURL, caption, imagePath, thumbURL
  };
}


