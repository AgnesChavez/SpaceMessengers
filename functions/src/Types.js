const admin = require('firebase-admin');

const typeStudent= "student";
const typeInstructor= "instructor";
const typeAdmin= "admin";

exports.student = typeStudent;
exports.instructor = typeInstructor;
exports.admin = typeAdmin;



// export function userTypes() {
//   return {
//     student: "student",
//     instructor: "instructor",
//     admin: "admin"
//   }
// }

function WorkshopData(name) {
  return {
    id: "",
    instructors: [],
    members: [],
    teams: [],
    institutions: [],
    name: name,
    date: admin.firestore.FieldValue.serverTimestamp(),
    created: admin.firestore.FieldValue.serverTimestamp(),
  }
}

function PairData(uid1, uid2) {
  return [uid1, uid2];
}

function TeamData(pair1, pair2, ws) {
  return {
    id: "",
    workshop: ws,
    members: [pair1[0], pair1[1], pair2[0], pair2[1]],
    boards: [],
    created: admin.firestore.FieldValue.serverTimestamp(),
  }
}


function UserData(uid, name, type, institutionId, workshopId) {
  // console.log("UserData: ", uid, name, type, institutionId);
  return {
    id: uid,
    type: type,
    location: "",
    bio: "",
    workshops: [workshopId],
    teams: [],
    institutionId: institutionId,
    teamsMap: null,
    photoURL: null,
    displayName: name,
    boards: [],
    partnerId:"",
    created: admin.firestore.FieldValue.serverTimestamp(),
  };
}
function BoardData(teamId) {
  return {
    id: "",
    messages: [],
    teamId,
    created: admin.firestore.FieldValue.serverTimestamp(),
  }
}

function InstitutionData(name) {
  return {
    name,
    created: admin.firestore.FieldValue.serverTimestamp(),
    members: [], 
    workshops: [],
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
exports.PairData = PairData;
exports.TeamData = TeamData;
exports.UserData = UserData;
exports.BoardData = BoardData;
exports.InstitutionData = InstitutionData;
exports.BoardMessageData = BoardMessageData;

