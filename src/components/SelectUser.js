import React from "react";

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { db } from "../services/firebase";

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

export function SelectUser(props){


return <form>
        <label>Select student</label>
            <select defaultValue={props.value} onChange={(e)=>props.onChange(e, props.selectorId)} className="browser-default"  >
                <option value="" disabled >Select a student to add</option>
                
                {props.usersArray && props.usersArray.map(ws => <RenderOption key={ws} uid={ws} /> )}
            </select>
        </form>
}
