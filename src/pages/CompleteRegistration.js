import React, { useState ,useEffect, useRef } from 'react';
import { auth } from "../services/firebase";
import { createUserInDb } from "../helpers/userManagement";
import {  Redirect } from 'react-router-dom';

import { getQueryData } from "../helpers/db"
import { db } from "../services/firebase";

import { Button, TextInput, Icon, Row, Col, Preloader} from 'react-materialize';



import '../css/registration.css';


export default function CompleteRegistration(props)  {

      const error = useRef(null);
      const email = useRef('');
      const emailInputRef = useRef(null);

      const [ completingRegistration, setCompletingRegistration] = useState(false);
      const [ requestingEmail, setRequestingEmail] = useState(false);


    async function verifyRegistration() {
        if (!email.current) {
            setRequestingEmail(true);
            setCompletingRegistration(false);
            return;
        }
        error.current = null;
        setRequestingEmail(false);
        setCompletingRegistration(true);

        if (auth().isSignInWithEmailLink(window.location.href)) {
            
            try {
                let result = await auth().signInWithEmailLink(email.current, window.location.href).get();
                console.log(result);
                if (result) {
                    
                    window.localStorage.removeItem('emailForSignIn');
                    
                    console.log("result.additionalUserInfo ", result.additionalUserInfo);
                    
                    let query = db.collection('unauthenticatedUsers').doc(email.current);
                    let user = await getQueryData(query);
                    if(user !== null){
                        await createUserInDb(result.user.uid, {name: user.name}, user.type, user.institution, user.workshopId);  
                        await query.delete();
                    }else{
                        await createUserInDb(result.user.uid, null, null, "", "");  
                    }
                    
                    <Redirect to="/board" />
                }else{
                    setCompletingRegistration(false);
                }
            } catch (e) {
                error.current = e;
                setCompletingRegistration(false);
            }
        }
    }

    useEffect(()=>verifyRegistration());

    
    
    async function handleSubmit(event) {
        event.preventDefault();
        // console.log(emailInputRef.current.value);
        email.current = emailInputRef.current.value;
        verifyRegistration();
    }


    return (
     <div className="container black-text">
        <div className="card-panel white registration-card">
        <div className='row'>
            <h4 className="center-align" >Complete your registration to Space Messengers</h4>
            {error.current ? 
                <div className="registration-error center-align z-depth-4">
                    <h6>Your registration Failed :(</h6> 
                    with the following error:<br/>
                    {error.current}
                    <br/>
                    Please try again or contact the administrator or instructor.
                </div>
                 : 
            null}
        </div>
        {requestingEmail ? 
            <div>
                <p>
                    Please write your email address to finish your registration.
                    <br/>
                    It must be the exact same email address where you received your registration link.
                </p>
                <form onSubmit={handleSubmit}>
                <TextInput
                    ref={emailInputRef}
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
            </div>
        : ""}
        {completingRegistration ? (
            <Row>
                <Col s={12} className="valign-wrapper" style={{justifyContent: "center"}}>
                <Preloader
                    active
                    color="blue"
                    flashing
                />
                <h5 style={{paddingLeft: "1rem"}}>Verifying...</h5>
                </Col>
            </Row>)
        : ""}
      </div>
      </div>
    );

}