import React, {useState, useEffect } from "react";



// import { auth } from "../services/firebase";
import { db } from "../services/firebase";
// 
// import 'firebase/firestore';
import { RenderSidebarUser } from '../components/RenderUser';

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { userTypes } from "../helpers/Types"

import { Button } from 'react-materialize';

// import UserProfile from "./UserProfile";

import '../css/board.css';

import Renameable from './Renameable'

import {openAddBoardModal,
        CreateTeamModalButton,
        ModalRemoveTeamButton } from './Modals'

import { removeUserFromTeam, removeBoard } from '../helpers/factory'

      
//----------------------------------------------------------------------------
function openAllCollapsibles(instance){
    let numChildren = 10;
    for(let i = 0; i < numChildren; i++){
        instance.open(i);
    }
}


//----------------------------------------------------------------------------
function initCollapsibles(elementSelector, isAccordion = false)
{
    var elems = document.querySelectorAll(elementSelector);
    let instances = window.M.Collapsible.init(elems, {accordion: isAccordion});
    if(!isAccordion){
        instances.forEach(i => openAllCollapsibles(i));
    }
    
}

function SidebarBoardName(props){
    return (<>
    <Renameable                         
        text={props.board.name}
        hoverColor= {props.board.color}
        isCurrent={props.board.id === props.user.currentBoard}
        onTextClick={()=> props.boardSelectHandle(props.board.id)}
        onRename={(newName)=> db.collection('boards').doc(props.board.id).update({name:newName})}
        isDisabled={!props.allowEditing || props.removingBoard}
        />
        {props.team && props.team.name && <span className="grey-text">{props.team.name}</span>}
        {props.removingBoard && <RemoveButton onRemove={()=> removeBoard(props.board.id)}/>}
        </>);
}


function SidebarBoardsCollection(props){
    const [boards, boardsLoading] = useCollectionData(
        db.collection("boards").where("teamId", "==", props.team.id));
   
   let [removingBoard, setRemovingBoard] = useState(false);
   let allowEditing = (props.isMember ===true || props.user.type !== userTypes().student);

    return (
        <>
            <li key={props.team.id}>
                <div className="collapsible-header">
                <span>Boards</span>
                   {allowEditing &&
                   <AddRemoveButtons name={"board"} 
                       onAdd={()=> openAddBoardModal(props.team.id)}
                       setRemoving={setRemovingBoard}
                       isRemoving={removingBoard}
                       />
               }
                </div>
                <ul className="collapsible-body">
                    {!boardsLoading && boards && boards.map(board => { return <li key={board.id} >
                        <div className="BoardsCollectionLi">
                            <SidebarBoardName
                                board={board}
                                user={props.user}
                                boardSelectHandle={props.boardSelectHandle}
                                allowEditing={allowEditing}
                                removingBoard={removingBoard}/>
                            </div>
                        </li>
                        }
                        )}
                </ul>
            </li>
        </>
    );
}

function SidebarBoardsOnlyCollection(props){
    const [boards, boardsLoading] = useCollectionData(
        db.collection("boards").where("teamId", "==", props.team.id));
   
   let allowEditing = (props.isMember ===true || props.user.type !== userTypes().student);

    return (
        <>
            {!boardsLoading && boards && boards.map(board => { return <li key={board.id} >
                <div className="BoardsCollectionLi">
                    <SidebarBoardName
                        board={board}
                        user={props.user}
                        team={props.team}
                        boardSelectHandle={props.boardSelectHandle}
                        allowEditing={allowEditing}
                        removingBoard={false}/>
                    </div>
                </li>
            }
        )}

        </>
    );
}



//----------------------------------------------------------------------------
export function SidebarTeamCollection(props){
    
//     let teamsQuery = db.collection("teams").where("workshopId", "==", props.workshopId);
// 
//     const [teams, teamsLoading] = useCollectionData(teamsQuery);
// 
//     const [myTeams, myTeamsLoading] = useCollectionData(teamsQuery.where("members", "array-contains", props.user.id));


    useEffect(() => initCollapsibles(".SidebarTeamCollection", true));

    return (
        <>
            <ul className="collapsible SidebarTeamCollection">
                {props.teams && props.myTeams &&
                    props.teams.map(team => <SidebarTeamLi key={team.id} 
                        team={team}
                        user={props.user}
                        boardSelectHandle={props.boardSelectHandle}
                        isMember={props.myTeams.includes(team.id)}
                        setOtherUserId={props.setOtherUserId}
                        /> )}
            </ul> 

            {props.user.type !== userTypes().student && <CreateTeamModalButton/>}
            {props.user.type !== userTypes().student && <ModalRemoveTeamButton/>}
        </>
    );
}



//----------------------------------------------------------------------------
export function SidebarAllBoards(props){
    
    return (
        <>
            <ul className="SidebarAllBoards">
                {props.teams && props.myTeams &&
                    props.teams.map(team => <SidebarBoardsOnlyCollection key={team.id} 
                        team={team}
                        user={props.user}
                        boardSelectHandle={props.boardSelectHandle}
                        isMember={props.myTeams.includes(team.id)}
                        /> )}
            </ul>
        </>
    );
}




//----------------------------------------------------------------------------
function SidebarUser(props)
{
  let [usr, usrLoading] = useDocumentData(db.collection('users').doc(props.uid));

  // let usr = getUserFromDb(props.uid);
  if(usr && ! usrLoading){
      return (
        <>
            <li key={usr.id} className="SidebarUser">
                <RenderSidebarUser usr={usr} setOtherUserId={props.setOtherUserId}/>
                {(props.isNotStudent && props.isRemoving) &&
                    <RemoveButton onRemove={()=>{ 
                                   if(props.newUserDestination.collection === 'teams'){
                                        removeUserFromTeam(usr.id, props.newUserDestination.dest.id);
                                    }
                                }}
                    />
                }
            </li> 
        </>);  
  }
  return null;
}


//----------------------------------------------------------------------------
function addUserTo(newDest){
    
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
}


//----------------------------------------------------------------------------
function RenderUsers(props)     
{
    let isNotStudent = props.currentUser.type !== userTypes().student;
    let [removingUser, setRemovingUser] = useState(false);
    
    return (<>
        <li>
            <div className="sidebarName collapsible-header"> 
                <span>{props.name}</span>

                {isNotStudent?
                    <AddRemoveButtons name={props.name} 
                        onAdd={()=> addUserTo(props.newUserDestination)}
                        setRemoving={setRemovingUser}
                        isRemoving={removingUser}
                        />
                :""}
            </div>
            <div className="collapsible-body">
            <ul>
                {props.users && 
                 props.users.map( i => <SidebarUser key={i}
                    newUserDestination={props.newUserDestination}
                    uid={i} 
                    isNotStudent={isNotStudent}
                    isRemoving={removingUser}
                    setOtherUserId={props.setOtherUserId}
                />)}
            </ul>
            </div>
        </li>
    </>);
}


// props.name
// props.onAdd
// props.setRemoving
// props.isRemoving
//----------------------------------------------------------------------------
function AddRemoveButtons(props){
    return (<>
        <div>
        <Button
            className="InlineTinyButton"
            node="button"
            tooltip={"Add new " + props.name}
            tooltipOptions={{
                position: 'top'
            }}
            waves="light"
            onClickCapture={(e)=>{
                e.preventDefault();
                e.stopPropagation();
                if(props.isRemoving) props.setRemoving(false);
                props.onAdd();
            }}
        >
            <i className=" tiny material-icons">add_circle_outline</i>
        </Button>
        <Button
            className="InlineTinyButton"
            node="button"
            tooltip={props.isRemoving?"Cancel removal":"Remove " + props.name}
            tooltipOptions={{
                position: 'right'
            }}
            waves="light"
            onClickCapture={(e)=>{
                e.preventDefault();
                e.stopPropagation();
                props.setRemoving(!props.isRemoving);
            }}
        >
            <i className=" tiny material-icons">{props.isRemoving?"cancel":"remove_circle_outline"}</i>
        </Button>
        </div>
    </>);
}


function RemoveButton(props){
 return <Button
            className="InlineTinyButton right"
            node="button"
            tooltip={"Remove"}
            tooltipOptions={{position: 'right'}}
            waves="light"
            onClickCapture={(e)=>{
                e.preventDefault();
                e.stopPropagation();
                props.onRemove();

            }}
        >
            <i className=" red tiny material-icons">remove_circle_outline</i>
        </Button>
}
//----------------------------------------------------------------------------
function SidebarTeamLi(props){
    return (<>
        <li>
            {/* {(props.user.type === userTypes().student)? */}
            {/* <p className="collapsible-header">{props.team.name}</p> */}
            {/* : */}
             <Renameable 
                textClassName="collapsible-header"
                text={props.team.name} 
                // hoverColor= {}
                
                onRename={(newName)=> db.collection('teams').doc(props.team.id).update({name:newName})}
                isDisabled={props.user.type === userTypes().student}
                />
            {/*  } */}
            <div className="collapsible-body">
                <SidebarTeam 
                    user={props.user} 
                    team={props.team} 
                    boardSelectHandle={props.boardSelectHandle} 
                    isMember={props.isMember}
                    setOtherUserId={props.setOtherUserId}
                />
            </div>
        </li>
    </>
    );
}


//----------------------------------------------------------------------------
function SidebarTeam(props){
    useEffect(() => initCollapsibles(".SidebarTeam"));
    return (<>
            <ul className="collapsible SidebarTeam">
                <RenderUsers 
                    name="Members" 
                    users={props.team.members} 
                    currentUser={props.user} 
                    newUserDestination={{dest:props.team, collection:'teams', field: 'members'}}
                    setOtherUserId={props.setOtherUserId}
                />
                <SidebarBoardsCollection 
                    user={props.user} 
                    team={props.team} 
                    boardSelectHandle={props.boardSelectHandle} 
                    isMember={props.isMember}
                />
            </ul>
    </>
    );
}



