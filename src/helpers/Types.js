import firebase from 'firebase/app';

export function userTypes() {
  return {
    student: "student",
    instructor: "instructor",
    admin: "admin"
  }
}

export function WorkshopData() {
  return {
    id: "",
    instructors: [],
    members: [],
    teams: [],
    institutions: [],
    name: "",
    date: null,
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
    boards: []
  }
}


export function UserData(uid, type) {
  return {
    id: uid,
    type: type,
    location: "",
    bio: "",
    workshops: [],
    teams: [],
    institutionId: "",
    teamsMap: null,
    photoURL: null,
    displayName: "",
    boards: []

  };
}
export function BoardData(teamId) {
  return {
    id: "",
    messages: [],
    teamId
  }
}

export function InstitutionData(name) {
  return {
    name,
    members: []
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