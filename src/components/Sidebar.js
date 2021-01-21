import React, {useEffect, useRef } from "react";



import { auth } from "../services/firebase";
import { db } from "../services/firebase";

import 'firebase/firestore';

// import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';


// import { getUserFromDb } from "../helpers/userManagement";

import { userTypes } from "../helpers/Types"

// import { Link } from 'react-router-dom';

import { Button, Modal } from 'react-materialize';

import UserProfile from "./UserProfile";

import '../css/board.css';

import Renameable from './Renameable'

import { ModalCreateWorkshop, CreateWorkshopModalButton,  ModalAddBoard, openAddBoardModal, ModalCreateTeam, CreateTeamModalButton, ModalAddUserToTeam } from './Modals'

import { removeUserFromTeam } from '../helpers/factory'

 
function SidebarUser(props)
{
  let [usr, usrLoading] = useDocumentData(db.collection('users').doc(props.uid));

  // let usr = getUserFromDb(props.uid);
  if(usr && ! usrLoading){
      return (
        <>
            <li key={usr.id} className="SidebarUser">
                <img className="circle"  alt={usr.displayName} src={usr.photoURL || ("https://i.pravatar.cc/24?u=" + usr.id)}/>
                <span className='name' style={('color' in usr)?{color: usr.color}:{}}>
                    {usr.displayName}
                </span>
                {props.isNotStudent ?
                    <Button
                    className="InlineTinyButton right"
                    node="button"
                    tooltip={"Remove"}
                    tooltipOptions={{
                        position: 'right'
                    }}
                    waves="light"
                    onClickCapture={(e)=>{
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(props.newUserDestination);
                        if(props.newUserDestination.collection === 'teams'){
                            removeUserFromTeam(usr.id, props.newUserDestination.dest.id);
                        }
                        // console.log(props.name+ " button clicked");
                    }}
                >
                    <i className=" tiny material-icons">remove_circle_outline</i>
                </Button>:""
                }
            </li> 
        </>);  
  }
  return null;
}
function addUserTo(newDest){
    // {{dest:props.team, collection:'teams', field: 'members'}}></RenderUsers>
    
    if(newDest.collection ===  'teams'){
        let modal = window.M.Modal.getInstance(document.getElementById('AddUserToTeamModal'));
        if(modal){
            console.log("addUserToTeam", newDest.dest.id)
            localStorage.setItem("addUserToTeam", newDest.dest.id);
            modal.open();        
        }else{
            console.log("addUserTo : modal invalid");
        }
    

    }
    // addToArray(newDest.collection, newDest.dest.id, newDest.field, data);


}
function RenderUsers(props)     
{
    // newUserDestination={{dest:props.workshop, collection:'workshops', field: 
    return (<>
        <li>
            <div className="sidebarName collapsible-header"> 
                <span>{props.name}</span>

                {(props.currentUser.type !== userTypes().student)?
                <Button
                    className="InlineTinyButton"
                    node="button"
                    tooltip={"Add new " + props.name}
                    tooltipOptions={{
                        position: 'right'
                    }}
                    waves="light"
                    onClickCapture={(e)=>{
                        e.preventDefault();
                        e.stopPropagation();
                        addUserTo(props.newUserDestination)
                        console.log(props.name+ " button clicked");
                    }}
                >
                    <i className=" tiny material-icons">add_circle_outline</i>
                </Button>
                :""}
            </div>
            <div className="collapsible-body">
            <ul>
                {props.users && props.users.map( i => <SidebarUser newUserDestination={props.newUserDestination} key={i} uid={i} isNotStudent={(props.currentUser.type !== userTypes().student)}/>)}
            </ul>
            </div>
        </li>
    </>);
}
function SidebarTeamLi(props){
    return (<>
        <li>
            <p className="collapsible-header">{props.team.name}</p>
            <div className="collapsible-body">
                <SidebarTeam user={props.user} team={props.team} boardSelectHandle={props.boardSelectHandle}/>
            </div>
        </li>
    </>
    );
}
function SidebarTeam(props){
    useEffect(() => initCollapsibles(".SidebarTeam"));
    return (<>
            <ul className="collapsible SidebarTeam">
                <RenderUsers name="Members" users={props.team.members} currentUser={props.user} newUserDestination={{dest:props.team, collection:'teams', field: 'members'}}></RenderUsers>
                <SidebarBoardsCollection user={props.user} team={props.team} boardSelectHandle={props.boardSelectHandle}/>
            </ul>
    </>
    );
}

function SidebarCurrentTeam(props){

    const [team, loading] = useDocumentData(db.collection("teams").doc(props.user.currentTeam));
    // console.log("SidebarCurrentTeam ", props.user.currentTeam);
    

    // if(!props.user.currentTeam) return <h6>Yo have not been assigned to any team.</h6>

    if(team && !loading){
        // console.log(team);
        <p>{team.name}</p>
        return  <SidebarTeam team={team} user={props.user} boardSelectHandle={props.boardSelectHandle}/> ;
    }
    return "";
}


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
                <img className="circle"  alt={usr.displayName} src={usr.photoURL || ("https://i.pravatar.cc/24?u=" + usr.id)}/>
                <span className='name' style={('color' in usr)?{color: usr.color}:{}}>
                    {usr.displayName}
                </span>
            </li> 
        </>);  
  }
  return null;
}


function SidebarSchool(props){
    
    return (<>
        <div className='row'>
            <div id={"schoolTab"+props.data.id} className="col s12 black-text" style={{backgroundColor: props.data.color}}>
                <h5 className="schoolname">{props.data.name}</h5>
                <h6 className="schoollocation">{props.data.location}</h6>
            </div>
        </div>
    </>);
}

function SidebarWorkshop(props){
    // console.log(props.workshop);
    // useEffect(() => initCollapsibles(".SidebarWorkshop"));
    // const tabsRef = useRef(null);
    

    let [school1, schoolLoading1] = useDocumentData(db.collection('institution').doc(props.workshop.institutions[0]));    
    let [school2, schoolLoading2] = useDocumentData(db.collection('institution').doc(props.workshop.institutions[1]));    
// 
//     useEffect(()=>{
//         let el = document.getElementById('SidebarWorkshop');
//         if(el){
//             if(!tabsRef.current){
//                 tabsRef.current = window.M.Tabs.init(el.querySelector(".tabs"), null);
//             }
//         }
//           return () => {
//             if(tabsRef.current){tabsRef.current.destroy(); tabsRef.current = null; }
//         };
//     });

    if(schoolLoading1 ||  !school1 || schoolLoading2 ||  !school2) return null;

    return (<>
        <div id="SidebarWorkshop" className='row'>
            <h5>{props.workshop.name}</h5>
                 <SidebarSchool data={school1} />
                 <SidebarSchool data={school2} />

            <div className='row'>
                <ul className="SidebarWorkshopStudents col s12">
                    {props.workshop.students && props.workshop.students.map( i => <SidebarStudent key={i} uid={i} school1={school1} school2={school2}  />)}    
                </ul>
            </div>    
        </div>
    </>);
}




function SidebarBoardsCollection(props){
    const [boards, boardsLoading] = useCollectionData(
        db.collection("boards").where("teamId", "==", props.team.id));

    const tooltipRef = useRef(null);
    useEffect(() => {
        if(!tooltipRef.current){
            tooltipRef.current = window.M.Tooltip.init(document.querySelector('#AddBoardButton'), null);
        }
        return ()=>{
            if(tooltipRef.current){tooltipRef.current.destroy(); tooltipRef.current = null; }
        }
    });
    

    return (
        <>
            <li>
                <div className="collapsible-header">
                <span>Boards</span>
                <button id="AddBoardButton" 
                    className="InlineTinyButton btn waves-effect waves-light tooltipped modal-trigger"
                    data-target="modalAddBoard" 
                    data-position="right" 
                    data-tooltip="Add a new board"
                    onClickCapture={(e)=>{
                                e.preventDefault();
                                e.stopPropagation();
                                openAddBoardModal(props.team.id);
                            }
                        }
                    >
                    <i className=" tiny material-icons">add_circle_outline</i>
                </button>
                </div>
                <ul className="collapsible-body">
                    {!boardsLoading && boards && boards.map(board => 
                        <Renameable 
                            key={board.id} 
                            text={board.name} 
                            hoverColor= {board.color}
                            onTextClick={()=> props.boardSelectHandle(board.id)}
                            onRename={(newName)=> db.collection('boards').doc(board.id).update({name:newName})}
                            />
                        // <li className="SidebarBoard" key={board.id} style={{color: board.color}} onClick={()=> props.boardSelectHandle(board.id)}>
                        //     {board.name}</li>
                        )}
                </ul>
            </li>
        </>
    );
}

function SidebarTeamCollection(props){

    const [teams, teamsLoading] = useCollectionData(getTeamsQueryForUser(props.user, props.workshopId)); 
    
    useEffect(() => initCollapsibles(".SidebarTeamCollection", true));

    return (
        <>
            <ul className="collapsible SidebarTeamCollection">
                { !teamsLoading && teams && teams.map(team => <SidebarTeamLi key={team.id} team={team} user={props.user} boardSelectHandle={props.boardSelectHandle}/> )}
            </ul> 

            <CreateTeamModalButton/>

        </>
    );
}

function openAllCollapsibles(instance){
    let numChildren = 10;
    for(let i = 0; i < numChildren; i++){
        instance.open(i);
    }
}

function initCollapsibles(elementSelector, isAccordion = false)
{
    var elems = document.querySelectorAll(elementSelector);
    let instances = window.M.Collapsible.init(elems, {accordion: isAccordion});
    if(!isAccordion){
        instances.forEach(i => openAllCollapsibles(i));
    }
    
}
function SelectWorkshop(props){
    if(props.workshops.length === 0) return null;
    return (<>
        <form>
            <label>Select Workshop</label>
            <select className="browser-default"  onChange={(evt)=> setCurrentWorkshop(props.userId, evt.target.value)}>
                {/* <option value="" disabled >Choose a workshop</option> */}
                {props.workshops && props.workshops.map(ws => <option key={ws.id} value={ws.id} > {ws.name} </option> )}
                {/* <option value="A">A</option> */}
                {/* <option value="B">B</option> */}
            </select>
        </form>
    </>)
}

function setCurrentWorkshop(userId, currentWorkshopId){
    db.collection('users').doc(userId).set({currentWorkshop: currentWorkshopId }, {merge: true});
}

function SidebarWorkshopCollection(props){
    const [workshops] = useCollectionData(getWorkshopQueryForUser(props.user)); 
    
    // useEffect(() => initCollapsibles(".SidebarWorkshopCollection"));

    
    if(props.user.type === userTypes().student && ( !workshops || ( workshops && workshops.length === 0 ))) 
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
            { currentWorkshop && <SidebarWorkshop workshop={currentWorkshop} user={props.user} /> }

            { workshops && <SelectWorkshop workshops={workshops} userId={props.user.id}/>}            
            { (props.user.type === userTypes().admin)? <CreateWorkshopModalButton/>:"" }

            { currentWorkshop && (props.user.type !== userTypes().student) && <ModalCreateTeam currentWorkshop={currentWorkshop} /> }
            { currentWorkshop && (props.user.type !== userTypes().student) && <ModalAddUserToTeam currentWorkshop={currentWorkshop}/> }

        </>)
}

function getTeamsQueryForUser(usr, workshopId){
    let wsId = (workshopId || "defaultWorkshop")
    
    let teams = db.collection("teams").where("workshopId", "==", wsId);

    if(usr.type === userTypes().student){
        return teams.where("members", "array-contains", usr.id);
    }
    return teams;
}


function getWorkshopQueryForUser(usr)
{
  let ws = db.collection("workshops");

  if(usr.type === userTypes().student){
    return ws.where("members", "array-contains", usr.id);
  }
  if(usr.type === userTypes().instructor){
    return ws.where("instructors", "array-contains", usr.id);
  }
  ws.orderBy("created", "desc");
  return ws;
}

function SidebarCurrentUser(props){

return (<>
    <div id="SidebarCurrentUser">
        <div id="SidebarCurrentUserBlock">
            <img className="circle" alt={props.user.name} src={props.user.image}/>
            <p className="name"> {props.user.name} </p>
        </div>    
        <div id="SidebarCurrentUserButtons">
            <Button flat className=" white-text modal-trigger" href="#profileModal" node="button">Profile</Button>
            <Button flat className=" white-text" onClick={() => auth().signOut()}>Logout</Button>
        </div>

    </div>
    </>);
}

export function Sidebar(props) {


    const tabsRef = useRef(null);
    const sidenavRef = useRef(null);

    let isNotStudent = (props.usr.type !==  userTypes().student);

    
    useEffect(()=>{
        let el = document.getElementById('SidebarLeft');
        if(el){
            if(!tabsRef.current){
                tabsRef.current = window.M.Tabs.init(el.querySelector(".tabs"), null);
            }
            if(!sidenavRef.current){
                sidenavRef.current = window.M.Sidenav.init(el, {  draggable: true, edge: "left"  });
                // sidenavRef.current.open();
                // sidenavRef.current.isOpen = true;
                // console.log("initing sidenav");
            }
        }
          return () => {
            if(sidenavRef.current){sidenavRef.current.destroy(); sidenavRef.current = null; }
            if(tabsRef.current){tabsRef.current.destroy(); tabsRef.current = null; }
            // console.log("destroying sidenav");
        };
    });

    
    let user = {
        image:  (props.usr.photoURL  || auth().currentUser.photoURL),
        name: (props.usr.displayName || auth().currentUser.displayName)
    };
    

    
    let teamTabLabel = "Team" + (isNotStudent?"s":"");

    return (<>
    <div id="SidebarLeftContainer" style={{transform: "translateX("+(props.isOpen?0:-300)+"px)"}}>

        <ul id="SidebarLeft" className="sidenav sidenav-fixed black white-text" >
    
            <SidebarCurrentUser className="white-text"  user={user} userType={props.usr.type}/>
            <div className="row">
                <div className="col s12">
                    <ul className="tabs tabs-fixed-width black white-text depth-1">
                        <li className="tab"><a className="active" href="#teamTab">{teamTabLabel}</a></li>
                        <li className="tab"><a href="#schoolsTab">Schools</a></li>
                    </ul>
            
                    <div id="teamTab" className="col s12">
                        { isNotStudent? 
                            <SidebarTeamCollection 
                                user={props.usr} 
                                workshopId={props.usr.currentWorkshop}
                                boardSelectHandle={props.boardSelectHandle}
                                />
                            :
                            <SidebarCurrentTeam 
                                user={props.usr} 
                                boardSelectHandle={props.boardSelectHandle} /> 
                        }
                    </div>
                    <div id="schoolsTab" className="col s12">
                        <SidebarWorkshopCollection user={props.usr} />
                    </div>
                </div>
            </div>        
        </ul>
    </div> 
        

    <ModalAddBoard/>
    
    
    { isNotStudent && <ModalCreateWorkshop/> }


  <Modal
    actions={[
      <Button flat modal="close" node="button" waves="green">Close</Button>
    ]}
    header="User Profile"
    id="profileModal"
  >
    <UserProfile  ></UserProfile>
  </Modal>

    </>)
}




