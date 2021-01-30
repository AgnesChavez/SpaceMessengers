import React from "react";

import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';

import { db } from "../services/firebase";

import { userTypes } from "../helpers/Types"

function RenderOption(props)
{
  let [usr, usrLoading] = useDocumentData(db.collection('users').doc(props.uid));

  if(usr && ! usrLoading){
      return (
        <>
            <option key={usr.id} value={usr.id}> {usr.displayName} </option>
        </>);  
  }
  return null;
}

function RenderTeamOption(props)
{
  let [team, teamLoading] = useDocumentData(db.collection('teams').doc(props.teamId));

  if(team && ! teamLoading){
      return (
        <>
            <option key={team.id} value={team.id}> {team.name} </option>
        </>);  
  }
  return null;
}



export function SelectUser(props){

  if(props.usersArray){
    props.usersArray.sort();
  }

return <form>
        <label>Select student</label>
            <select defaultValue={props.value} onChange={(e)=>props.onChange(e, props.selectorId)} className="browser-default"  >
                <option value="" disabled >Select a student or instructor</option>
                
                {props.usersArray && props.usersArray.map(ws => <RenderOption key={ws} uid={ws} /> )}
            </select>
        </form>
}

export function SelectTeam(props){
  let [teams, teamsLoading] = useCollectionData(db.collection('teams').where("workshopId", "==", props.currentWorkshop.id ));
  if(props.usersArray){
    props.usersArray.sort();
  }

if(teamsLoading){
  return <p>Loading teams</p>
}
if(!teamsLoading && (!teams || (teams && teams.length === 0))){
  return <p>No teams available</p>
}

return <form>
        <label>Select team</label>
            <select defaultValue={props.value} onChange={(e)=>props.onChange(e, props.selectorId)} className="browser-default"  >
                <option value="" disabled >Select a team</option>
                
                {!teamsLoading && teams && teams.map(team => <RenderTeamOption key={team.id} teamId={team.id} /> )} 
            </select>
        </form>
}




function RadioGroupItem(props){

    return <p>
        <label>
          <input className="with-gap" onChange={props.onChange} name={props.group} type="radio" value={props.value} checked={props.checked}/>
          <span>{props.label}</span>
          </label>
        </p>

}

function SelectSchoolItem(props){
    let [school, schoolLoading] = useDocumentData(db.collection('institution').doc(props.schoolId));
    if(school && !schoolLoading ){
        return  <RadioGroupItem onChange={props.onChange} group={props.group} label={school.name + ", " + school.location} value={props.schoolId}/>
    }else{
        return "";
    }
}


export function SelectSchool(props){
    
return (<>
        <RadioGroupItem onChange={props.onChange} group={props.selectorId} label={"none"} value={""}/>
        {props.currentWorkshop &&
            props.currentWorkshop.institutions.map(school => <SelectSchoolItem key={school} schoolId={school} group={props.selectorId} onChange={props.onChange}/>)
        }    
        </>)
}


export function SelectUserTypeButtons(props){
    
return (<>
        <RadioGroupItem onChange={props.onChange} group={props.selectorId} label={"Student"} value={userTypes().student} checked/>
        <RadioGroupItem onChange={props.onChange} group={props.selectorId} label={"Instructor"} value={userTypes().instructor}/>
        <RadioGroupItem onChange={props.onChange} group={props.selectorId} label={"Admin"} value={userTypes().admin}/>
       </>)
}

