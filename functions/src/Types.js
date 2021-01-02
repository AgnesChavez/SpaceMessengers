const admin = require('firebase-admin');

const typeStudent= "student";
const typeInstructor= "instructor";
const typeAdmin= "admin";

exports.student = typeStudent;
exports.instructor = typeInstructor;
exports.admin = typeAdmin;

const { getRandomInt } = require('./utils.js');



function Color(r=255, g=255, b=255, a=1){
  return {r, g, b, a};
}


// function randomColor()
// {
//   return Color(getRandomInt(0,255), getRandomInt(0,255), getRandomInt(0,255), 1);
// }
function randomColorHSL(){
  return "hsl("+ getRandomInt(0,360) + ", " + getRandomInt(90,100) + "%, 50%)" 
}


function WorkshopData(name) {
  return {
    id: "",
    instructors: [],
    institutions: [],
    students: [],
    name: name,
    date: admin.firestore.FieldValue.serverTimestamp(),
    created: admin.firestore.FieldValue.serverTimestamp(),
  }
}


function TeamData(workshopId, membersArray) {
  return {
    id: "",
    name:"",
    workshopId,
    members: Array.isArray(membersArray)?membersArray:[],
    created: admin.firestore.FieldValue.serverTimestamp(),
  }
}


function UserData(uid, name, type, institutionId) {
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
    created: admin.firestore.FieldValue.serverTimestamp(),
  };
}
function BoardData(teamId, name) {
  return {
    id: "",
    messages: [],
    color: randomColorHSL(),
    teamId,
    name,
    created: admin.firestore.FieldValue.serverTimestamp(),
  }
}

function InstitutionData(name) {
  return {
    id:"",
    name,
    color: randomColorHSL(),
    created: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function BoardMessageData(uid, boardId) {
  return {
    content: "",
    created: admin.firestore.FieldValue.serverTimestamp(),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
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


exports.WorkshopData = WorkshopData;
exports.TeamData = TeamData;
exports.UserData = UserData;
exports.BoardData = BoardData;
exports.InstitutionData = InstitutionData;
exports.BoardMessageData = BoardMessageData;

exports.randomColorHSL = randomColorHSL;