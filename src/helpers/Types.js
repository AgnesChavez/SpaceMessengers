import firebase from 'firebase/app';

export function userTypes() {
  return {
    student: "student",
    instructor: "instructor",
    admin: "admin"
  }
}

export function WorkshopData(name) {
  return {
    id: "",
    instructors: [],
    members: [],
    teams: [],
    institutions: [],
    name: name,
    date: firebase.firestore.Timestamp.now(),
    created: firebase.firestore.FieldValue.serverTimestamp(),
  }
}

export function PairData(uid1, uid2) {
  return [uid1, uid2];
}

export function TeamData(pair1, pair2, ws) {
  return {
    id: "",
    workshop: ws,
    members: [pair1[0], pair1[1], pair2[0], pair2[1]],
    boards: [],
    created: firebase.firestore.FieldValue.serverTimestamp(),
  }
}


export function UserData(uid, name, type, institutionId, workshopId) {
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
    created: firebase.firestore.FieldValue.serverTimestamp(),
  };
}
export function BoardData(teamId) {
  return {
    id: "",
    messages: [],
    teamId,
    created: firebase.firestore.FieldValue.serverTimestamp(),
  }
}

export function InstitutionData(name) {
  return {
    name,
    created: firebase.firestore.FieldValue.serverTimestamp(),
    members: [], 
    workshops: [],
  };
}

export function BoardMessageData(uid, boardId) {
  return {
    content: "",
    created: firebase.firestore.FieldValue.serverTimestamp(),
    timestamp: firebase.firestore.Timestamp.now(),
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