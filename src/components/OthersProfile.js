import React from "react";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { CenteredPreloader } from '../components/CenteredPreloader'

import { Modal, Button } from 'react-materialize';

import { db } from "../services/firebase";

function DrawProp(props){
	return <div className="row">    
    	<div className="col s12 grey-text text-darken-4">
    		<span style={{marginRight: 10 + 'px'}} className="">{props.label}</span>
    		<span className="input-group-text " >{props.value}</span>
    	</div>
    </div>
}

function RenderProfile(props){
	return (
        
        <div className="row">
            <div className="col s12 m4">
                <div className="profile-img">
                    <img src={props.user.photoURL} alt=""/>
                </div>
            </div>
            <div className="col s12 m6">
			<DrawProp  label="Location" value={props.user.location} />
            <DrawProp  label="Bio" value={props.user.bio } />
        </div>
    </div>
    )
}

export function ModalOtherUserProfile(props){
	let [usr, usrLoading] = useDocumentData(db.collection('users').doc(props.userId));

	return <Modal
    	actions={[<Button flat modal="close" node="button" waves="red">Close</Button>]}
    	className="black-text"
    	header={(usr && !usrLoading)?usr.displayName :"Loading"}
    	id="ModalOtherUserProfile"
    	root={document.getElementById('modalRoot')}
  	>
  		 { usr && !usrLoading? 
  		 	<RenderProfile user={usr}/> :
  		 	<CenteredPreloader title="Loading"/>
  		 } 
  	</Modal>
}

            
