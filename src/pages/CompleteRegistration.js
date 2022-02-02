import React, { useState, useEffect, useRef } from 'react';
import { auth } from "../services/firebase";

import { getQueryData } from "../helpers/db"
import { db } from "../services/firebase";


import { Button, TextInput, Icon, Row, Col, Preloader} from 'react-materialize';
import firebase from "firebase";


import '../css/registration.css';



    const completingRegistration = "completingRegistration";
    const registrationComplete = "registrationComplete";
    const errorState = "errorState";
    const failState = "failState";
    const requestingEmail = "requestingEmail";


function DrawError(props){
    return (<>
     {(props.state === errorState)?
        <div className="registration-error center-align z-depth-4">
            <h6>Your registration Failed :(</h6> 
            with the following error:<br/>
            {props.error}
            <br/>
            Please try again or contact the administrator or instructor.
        </div>
    :''}
    </>);
}

function RequestEmail(props){    
    return(<>
        {(props.state === requestingEmail) ?
        <div>
            <p>
                Please write your email address to finish your registration.
                <br/>
                It must be the exact same email address where you received your registration link.
            </p>
            <form onSubmit={props.handleSubmit}>
                <TextInput
                    ref={props.emailInputRef}
                    email
                    id="EmailInput"
                    label="Email"
                    validate
                />
                <Button
                    node="button"
                    type="submit"
                    waves="light"
                >
                Submit<Icon right>send</Icon>
                </Button>
            </form>
        </div>:""}
    </>);
}


function Verifying(props){
    return(<>
        {(props.state === completingRegistration)?
        <Row>
            <Col s={12} className="valign-wrapper" style={{justifyContent: "center"}}>
                <Preloader
                    active
                    color="blue"
                    flashing
                />
                <h5 style={{paddingLeft: "1rem"}}>Verifying...</h5>
            </Col>
        </Row>
        :""}
    </>);
}


export default function CompleteRegistration(props)  {

      const error = useRef(null);
      const email = useRef('');
      const emailInputRef = useRef(null);


      const [ state, setState] = useState(requestingEmail);
      
    function errorFunc(e){
      error.current = e;
      setState(errorState);
    }


    useEffect(()=>{
        var storedEmail = window.localStorage.getItem('emailForSignIn');
        if(storedEmail !== null && storedEmail !== '' ){
            email.current = storedEmail;
            verifyRegistration();            
        }
    });
    

    async function swapUserIdInArray( collectionId, arrayId, oldUserId, newUserId){
        let querySnapshot = await db.collection(collectionId).where(arrayId, "array-contains", oldUserId).get(); 
        for(let i = 0; i < querySnapshot.docs.length; i++){
            let docQuery = db.collection(collectionId).doc(querySnapshot.docs[i].id);
            await docQuery.update({
                [arrayId]: firebase.firestore.FieldValue.arrayUnion(newUserId)
            });
            await docQuery.update({
                [arrayId]: firebase.firestore.FieldValue.arrayRemove(oldUserId)
            });
        }
    }

    async function swapUserId( oldUserId, newUserId){
    
        await swapUserIdInArray("institution", "members", oldUserId, newUserId);
        await swapUserIdInArray("teams", "members", oldUserId, newUserId);
        await swapUserIdInArray("workshops", "instructors", oldUserId, newUserId);
        await swapUserIdInArray("workshops", "students", oldUserId, newUserId);
        
    }

    async function verifyRegistration() {
        
        if(state === requestingEmail){
            error.current = null;

            // email.current = window.prompt('Please provide your email for confirmation');
            // requestingEmail.current = false;
            
            if(email.current){

            setState(completingRegistration);
                if (auth().isSignInWithEmailLink(window.location.href)) {    
                    auth().signInWithEmailLink(email.current, window.location.href).then(async(result)=>{
                        // console.log(result);
                        if (result) {
                            

                             window.localStorage.removeItem('emailForSignIn');
                                // result.user.uid
                                let user = await getQueryData(db.collection("users").doc(result.user.uid));
                                if(!user){
                                    let querySnapshot = await db.collection("users").where("email", "==",  email.current).get();
                                    
                                    if(querySnapshot.docs.length > 0){
                                        await db.collection("users").doc(result.user.uid).set( querySnapshot.docs[0].data(), { merge: false });
                                        await db.collection("users").doc(result.user.uid).update({id: result.user.uid});
                                        await swapUserId( querySnapshot.docs[0].id, result.user.uid);
                                        await db.collection("users").doc(querySnapshot.docs[0].id).delete();
                                    }

                                }

                                setState(registrationComplete); 
                                window.location.replace('https://space-messengers.web.app/board');
                        }else{
                            setState(failState);
                        }
                    }).catch(e=>errorFunc(e));
                }
            }
        }
    }


    async function handleSubmit(event) {
        event.preventDefault();
        if(emailInputRef.current){
            email.current = emailInputRef.current.value.trim().toLowerCase();
            verifyRegistration();
        }else{
            console.log("invalid emailInputRef", emailInputRef.current);
        }
    }

 return (<>
        <div className="container black-text">
            <div className="card-panel white registration-card">
                <div className='row'>
                    <h4 className="center-align" >Logging you into Space Messengers...</h4>
                    <DrawError error={error.current} state={state} />
                    <RequestEmail handleSubmit={handleSubmit} emailInputRef={emailInputRef} state={state} />
                    <Verifying state={state}/>
                    {(state === failState)? <p>Failed</p>:""}
                </div>
            </div>
        </div>
    </>);
}