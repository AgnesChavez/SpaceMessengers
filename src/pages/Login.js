


import React, { useState, useRef } from 'react';
// import {  signInWithGoogle } from "../helpers/auth";

import { Button, TextInput, Icon, Row, Col, Preloader} from 'react-materialize';

import { sendLogInEmail } from "../helpers/userManagement";

// import { db } from "../services/firebase";

import '../css/registration.css';


async function checkEmail(email, callback, setError){

    let encodedEmail = '';
    try{
        encodedEmail = encodeURIComponent(email);
    
    

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
       // Typical action to be performed when the document is ready:
        // console.log(xhttp.response);

        let response = JSON.parse(xhttp.responseText);
        // console.log(response.valid);
        callback(response.valid);
    }
    };
    xhttp.open("GET", "https://space-messengers.web.app/api/checkEmail?email="+encodedEmail, true);
    xhttp.send();


    }catch(e){
        setError(e);
        return;
    }
    // try{
    //     let querySnapshot = await db.collection("users").where("email", "==", email).get();
    //     if(querySnapshot.size > 0){
    //         return true;
    //     }
    // }catch(e) {
    //     setError(e);
    //     console.log("Error getting documents: ", e);
    //     return false;
    // }
    // return false;
}


function DrawError(props){
    return (<>
     {(props.error !== null && props.state === errorState)?
        <div className="registration-error center-align z-depth-4">
            <h6>Login Failed :(</h6> 
            {props.error}
            <br/>
            Please try again or contact the administrator or instructor.
        </div>
    :''}
    </>);
}

function RequestEmail(props){    
    return(<>
        {( props.state === requestingEmail || props.state ===  invalidEmail )?
        <div>
            <p>
                Please enter your email to log in.
            </p>
            <form onSubmit={props.handleSubmit}>
                <Row>
                    <Col s={12}>
                <TextInput
                    ref={props.emailInputRef}
                    email
                    id="EmailInput"
                    label="Email"
                    validate
                />
                </Col>
                </Row>
                <Row>
                <Button
                    node="button"
                    type="submit"
                    waves="light"
                >
                Submit<Icon right>send</Icon>
                </Button>
                </Row>
            </form>
        </div>:""}
    </>);
}


function Verifying(props){
    return(<>
        {(props.state === verifyingLogin)?
        <Row>
            <Col s={12} className="valign-wrapper" style={{justifyContent: "center"}}>
                <Preloader
                    active
                    color="blue"
                    flashing
                />
                <h5 style={{paddingLeft: "1rem"}}>Logging in...</h5>
            </Col>
        </Row>
        :""}
    </>);
}

function LoginComplete(props){

   return(<>
        {( props.state === loginComplete )?
        <div>
            <h6>Check your email!</h6>
            <p>
                You have been sent an email with an access link to the email you just entered.
            </p>
        </div>
        :""}
    </>);

}
function InvalidEmail(props){
return(<>
        {( props.state === invalidEmail )?
        <div style={{width: "100%", backgroundColor: "red", color: "white"}}>
            <p>
                The email you just entered is not registered.
                <br/>
                Please try again.
            </p>
        </div>
        :""}
    </>);    
}



    const requestingEmail = "requestingEmail";
    const verifyingLogin = "verifyingLogin";
    const loginComplete = "loginComplete";
    const errorState = "errorState";
    const invalidEmail = "invalidEmail";


export default function Login(props)  {

    const error = useRef(null);
    const email = useRef(null);
    const emailInputRef = useRef(null);

    const [ state, setState] = useState(requestingEmail);
    

    function validEmailCallback(isValid){
        if(isValid){
            window.localStorage.setItem('emailForSignIn', email.current);
            sendLogInEmail(email.current);
            setState(loginComplete);
        }else{
            setState(invalidEmail);
        }
    }

    function onError(e){
       error.current = e;
       setState(errorState);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if((state === requestingEmail || state ===  invalidEmail ) && emailInputRef.current){
            error.current = null;
                email.current = emailInputRef.current.value.trim().toLowerCase();
            try {
                setState(verifyingLogin);

                checkEmail(email.current, validEmailCallback, onError);
                
                // await signin(emailInputRef.current.value, passInputRef.current.value);
            } catch (e) {
                onError(e);
            }
        }else{
            console.log("invalid emailInputRef", emailInputRef.current);
        }
    }

    return (<>
        <div className="container black-text">
            <div className="card-panel white registration-card">
                <div className='row'>
                    <h4 className="center-align" >Login to Space Messengers</h4>
                    <DrawError error={error.current} state={state} />
                    <InvalidEmail state={state} />
                    <RequestEmail handleSubmit={handleSubmit} emailInputRef={emailInputRef} state={state} />
                    <Verifying state={state} />
                    <LoginComplete state={state} />
                    
                    {/* <button className="btn" type="button" onClick={()=>signInWithGoogle()}> */}
                    {/*       Sign in with Google */}
                    {/* </button> */}
                </div>
            </div>
        </div>
    </>);
}