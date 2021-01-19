import React, { useEffect, useRef } from "react";

// import {Col, Row, Select } from 'react-materialize';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { db } from "../services/firebase";

function RenderOption(props)
{
  let [usr, usrLoading] = useDocumentData(db.collection('users').doc(props.uid));

  // let usr = getUserFromDb(props.uid);
  if(usr && ! usrLoading){
      return (
        <>
            {/* <li key={usr.id} className="SidebarUser"> */}
            <option key={usr.id} value={usr.id}> {usr.displayName} </option>
                {/* <img className="circle"  alt={usr.displayName} src={usr.photoURL || ("https://i.pravatar.cc/24?u=" + usr.id)}/> */}
                {/* <span className='name' style={('color' in usr)?{color: usr.color}:{}}> */}
                    {/* {usr.displayName} */}
                {/* </span> */}
            {/* </li>  */}
        </>);  
  }
  return null;
}

export function SelectUser(props){


return <form>
        <label>Select student</label>
            <select defaultValue={props.value} onChange={(e)=>props.onChange(e, props.selectorId)} className="browser-default"  >
                <option value="" disabled >Select a student</option>
                
                {props.usersArray && props.usersArray.map(ws => <RenderOption key={ws} uid={ws} /> )}
                

            </select>
        </form>
}

// {props.usersArray && props.usersArray.map(ws => <option key={ws} value={ws} > {ws} </option> )}