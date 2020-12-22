import firebase from 'firebase/app';

export function userTypes() {
    return{
        student :"student",
        instructor: "instructor",
        admin: "admin"
    }
}

export function Workshop () {
	return {
    id: "",
	instructors: [],
	members:[],
	teams:[],
    institutions:[],
	name: "",
	date: null,
    }
}

export function Pair(uid1, uid2)
{
    return [ uid1, uid2];
}

export function Team(pair1, pair2, ws) {
    return {
	id: "",
    workshop: ws,
	members:[pair1[0], pair1[1], pair2[0], pair2[1]],
	boards: []
    }
}


 export function User (uid, type){
    return {
        id : uid,
        type : type,
        location : "",
        bio : "",
        workshops : [],
        teams : [],
        institutionId:"",
        teamsMap: null,
        photoURL: null,
        displayName: ""
    };
}
export function Board(teamId)
{
    return {
        id:"",
        messages:[],
        teamId
    }
}

export function Institution(name)
{
    return{
        name, 
        members:[]
    };
}

export function BoardMessageData(uid, boardId)
{
    return {
        content: "",
        created: firebase.firestore.FieldValue.serverTimestamp(),
        timestamp: firebase.firestore.Timestamp.now(),
        uid,
        id: null,
        boardId,
        position: {x:0, y:0}
    };
}