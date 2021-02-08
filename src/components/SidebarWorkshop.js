

import { db } from "../services/firebase";


// import 'firebase/firestore';
// import { useAuthState } from 'react-firebase-hooks/auth';
import { RenderSidebarUser } from '../components/RenderUser';

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

// import { getUserFromDb } from "../helpers/userManagement";

import { userTypes } from "../helpers/Types"

// import { Link } from 'react-router-dom';

import { Button } from 'react-materialize';

// import UserProfile from "./UserProfile";

import '../css/board.css';

// import Renameable from './Renameable'

import {
    DownloadMessagesButton,
    // ModalCreateWorkshop,
        CreateWorkshopModalButton,
        // ModalAddBoard,
        // openAddBoardModal,
        ModalCreateTeam,
        // CreateTeamModalButton,
        ModalAddUserToTeam,
        ModalCreateUser,
        ModalRemoveUser,
        ModalRemoveTeam,
        // ModalRemoveTeamButton 
    } from './Modals'

// import { removeUserFromTeam } from '../helpers/factory'

      

function SidebarStudent(props)
{
    let [usr, usrLoading] = useDocumentData(db.collection('users').doc(props.uid));

  // let usr = getUserFromDb(props.uid);
    if(usr && ! usrLoading){

        let schoolColor = "transparent";
        if(usr.institutionId === props.school1.id){
            schoolColor = props.school1.color;
        }else 
        if(usr.institutionId === props.school2.id){
            schoolColor = props.school2.color;
        }

        return (<>
            <li key={usr.id} className="SidebarUser" style={{borderRight: schoolColor+ "solid 4px"}}>
                <RenderSidebarUser usr={usr} setOtherUserId={props.setOtherUserId}/>
                {/* <button  onClick={()=>props.setOtherUserId(usr.id)}> */}
                {/* <img className="circle"  alt={usr.displayName} src={usr.photoURL || ("https://i.pravatar.cc/24?u=" + usr.id)}/> */}
                {/* <span className='name' style={('color' in usr)?{color: usr.color}:{}}> */}
                {/*     {usr.displayName} */}
                {/* </span> */}
                {/* </button> */}
            </li> 
        </>);  
    }
    return null;
}


function SidebarSchool(props){
    
    return (<>
        <div className='row'>
            <div id={"schoolTab"+props.data.id} className="col s12 black-text" style={{backgroundColor: props.data.color}}>
                <h6 className="schoolname">{props.data.name + ', ' + props.data.location}</h6>
            </div>
        </div>
    </>);
}

function SidebarWorkshop(props){

    let [school1, schoolLoading1] = useDocumentData(db.collection('institution').doc(props.workshop.institutions[0]));    
    let [school2, schoolLoading2] = useDocumentData(db.collection('institution').doc(props.workshop.institutions[1]));    

    if(schoolLoading1 ||  !school1 || schoolLoading2 ||  !school2) return null;

    return (<>
        <div id="SidebarWorkshop" className='row'>
            <h5>{props.workshop.name}</h5>
                 <SidebarSchool data={school1} />
                 <SidebarSchool data={school2} />

            <div className='row'>
                <ul className="SidebarWorkshopStudents col s12">
                    {props.workshop.students && props.workshop.students.map( i => <SidebarStudent key={i} uid={i} school1={school1} school2={school2}  setOtherUserId={props.setOtherUserId}/>)}    
                </ul>
            </div>    
        </div>
    </>);
}


function getWorkshopQueryForUser(usr){

  let ws = db.collection("workshops");

  if(usr.type === userTypes().student){
    return ws.where("students", "array-contains", usr.id);
  }
  if(usr.type === userTypes().instructor){
    return ws.where("instructors", "array-contains", usr.id);
  }
  ws.orderBy("created", "desc");
  return ws;
}

function SelectWorkshop(props){
    if(props.workshops.length === 0) return "";
    return (<>
        <div>
        <form>
            <label>Select Workshop</label>
            <select className="browser-default"  onChange={(evt)=> setCurrentWorkshop(props.userId, evt.target.value)}>
                {props.workshops && props.workshops.map(ws => <option key={ws.id} value={ws.id} > {ws.name} </option> )}
            </select>
        </form>
        </div>
    </>)
}

function setCurrentWorkshop(userId, currentWorkshopId){
    db.collection('users').doc(userId).set({currentWorkshop: currentWorkshopId }, {merge: true});
}

export function SidebarWorkshopCollection(props){
    const [workshops, workshopsLoading] = useCollectionData(getWorkshopQueryForUser(props.user)); 
    
    // useEffect(() => initCollapsibles(".SidebarWorkshopCollection"));

    
    if(props.user.type === userTypes().student && !workshopsLoading && ( !workshops || ( workshops && workshops.length === 0 ))) 
        return (<h6>You are not part of any workshop!</h6> );
    
    let currentWorkshop = null; 
    // console.log(workshops);
    if(workshops){
        if(props.user.currentWorkshop ){
            for(let i = 0; i < workshops.length; i++){
                if(props.user.currentWorkshop === workshops[i].id ){
                    currentWorkshop = workshops[i];
                }
            }
        }
        if(! currentWorkshop && workshops && workshops.length > 0){
            currentWorkshop = workshops[0];
            // console.log("settings users current workshop to ", currentWorkshop);
            setCurrentWorkshop(props.user.id, currentWorkshop.id);
            // db.collection('users').doc(props.user.id).set({currentWorkshop: currentWorkshop.id}, {merge: true});
        }
    }

    return (
        <>
            { currentWorkshop && <SidebarWorkshop workshop={currentWorkshop} user={props.user} setOtherUserId={props.setOtherUserId}/> }

            { currentWorkshop && (props.user.type === userTypes().admin) && <ModalCreateUser currentWorkshop={currentWorkshop}/> }
            { currentWorkshop && (props.user.type === userTypes().admin) && <ModalRemoveUser currentWorkshop={currentWorkshop}/> }

            { workshops && <SelectWorkshop workshops={workshops} userId={props.user.id}/>}            
            { (props.user.type === userTypes().admin)? <CreateWorkshopModalButton/>:"" }

            { currentWorkshop && (props.user.type !== userTypes().student) && <ModalCreateTeam currentWorkshop={currentWorkshop} /> }
            { currentWorkshop && (props.user.type !== userTypes().student) && <ModalRemoveTeam currentWorkshop={currentWorkshop} /> }
            { currentWorkshop && (props.user.type !== userTypes().student) && <ModalAddUserToTeam currentWorkshop={currentWorkshop}/> }

            { currentWorkshop && (props.user.type === userTypes().admin) && <DownloadMessagesButton currentWorkshopId={currentWorkshop.id}/> }
            

    </>)
}