import React, {useState, useEffect } from "react";

import { auth } from "../services/firebase";

import { db } from "../services/firebase";

import { setDataInDb } from "../helpers/db";

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { Button, Icon } from 'react-materialize';

import { CenteredPreloader } from '../components/CenteredPreloader'

import { storageRef } from "../services/firebase";

// import Renameable from './Renameable'

function ProfileButtons(props){

    return  <div className="WorkshopButtons">
                <Button
                    className="white black-text"
                    node="button"
                    waves="light"
                    onClick={props.onCancel}
                >Cancel
                </Button> 
                <Button 
                    className=""
                    node="button"
                    waves="light" 
                    onClick={props.okCallback}
                >{props.label}
                </Button> 
            </div>
}

     function UserProp(props) {
        let edit = (props.value != null && props.isEditable && props.isEditing);
        return <div className="row" style={{marginBottom: "unset"}}>    
            <div className="col s12 grey-text text-darken-4">
            <span style={{marginRight: 10 + 'px'}} className="" id={props.id+"_label"}>{props.label}</span>
            { edit && (
            <div className="InputProfile input-field inline">
            <input className="InputProfile"
                  id={props.id+"_input"}
                    type="text"
                    placeholder={props.value}
                    aria-label={props.label}
                    onChange={(e)=>props.handler(e.target.value)}
                    defaultValue={props.value}
                    name={props.id}
                    />
            </div>)}
            { (!edit) && ( <span className="input-group-text " >{props.value}</span>)}
            </div>
            </div>
    }


export default function UserProfile (props){

        // const [dbUser, setDbUser] = useState({
        //         displayName: "",
        //         bio: "",
        //         location: "",
        //         type: ""
        // });
        const [displayName, setDisplayName ] = useState( "" );
        const [bio, setBio ] = useState( "" );
        const [location, setLocation ] = useState( "" );
        const [email, setEmail] = useState( "" );
        const [photoURL, setPhotoURL] = useState( "" );
        // const [type, setType ] = useState( "" );
        const [isEditing, setIsEditing ] = useState( false );
        // const [userData, setUserData] = useState( null);

        const [sending, setSending] = useState(false);

        useEffect(()=>{
                let uid = auth().currentUser.uid;

                db.collection("users").doc(uid).get()
                .then(user => {
                        if(user.exists){
                                let d = user.data();
                                
                                setDisplayName( d.displayName );
                                setBio( d.bio );
                                setLocation( d.location);
                                setEmail(d.email);
                                setPhotoURL(d.photoURL);
                                // setUserData(d);
                                        // type: d.type
                        }
                        else
                        {
                                console.log("User ", uid, "does not exist");
                        }
                }).catch(error=>{
                        console.error("Error retrieving user: ", uid, "  error: ", error);
                });
        },[]);


    async function  handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    
    
        if (evt.target.files && evt.target.files.length) {
    
            let type = evt.target.files[0].type;
    
            if (!type.startsWith("image/")) {
                alert("The selected file seems not to be an image. Please choose an image.");
                return;
            }
    
            let ext = (type.split("/")[1]);
            // console.log("ext: " + ext);
    
            let uid = auth().currentUser.uid;
            try {
                let snapshot = await storageRef.child('usersAvatar/' + uid + '.' + ext).put(evt.target.files[0]);
    
                // console.log('Uploaded', snapshzzot.totalBytes, 'bytes.');
                // console.log('File metadata:', snapshot.metadata);
                // Let's get a download URL for the file.
                let url = await snapshot.ref.getDownloadURL();
                await db.collection("users").doc(uid).update({photoURL: url });
                setPhotoURL(url);
                
                
            } catch (error) {
                console.log('Upload failed:', error);
            }
        }
    }


     function saveProfile(onSave) {
        if(isEditing){
        setSending(true);
        setDataInDb("users", auth().currentUser.uid, {
                displayName: displayName,
                bio: bio,
                location: location,
                email: email, 
                photoURL: photoURL
        }, true); 
                
        setSending(false);
        window.M.toast({html: 'Successfully saved your profile!'});
        
        }
        onSave();
    }



        if(sending){
                return <CenteredPreloader title={"Saving profile"}/>;
        }else{
        return (
                <>
            <div >
                <div className="row">
                    <div className="col s12 m4">
                        <div className="profile-img">
                            <img src={photoURL} alt=""/>
                            <label htmlFor="photo-upload" className="custom-file-upload">Change Photo</label>
                            <input id="photo-upload" type="file" name="file" onChange={handleFileSelect}/>
                            

                        </div>
                    </div>
                    <div className="col s12 m6">
                        <div className="profile-head">
                                <h5>
                                    {displayName}
                                </h5>
                        </div>
                        { isEditing &&
                                <UserProp label = "Name" value = {displayName} id = "displayName" isEditable = {true} handler={(txt)=> setDisplayName(txt)} isEditing={isEditing}/>
                        }
                        <UserProp label = "Bio" value = {bio} id = "bio" isEditable = {true} handler={(txt)=> setBio(txt)} isEditing={isEditing}/>
                        <UserProp label = "Location" value = {location} id = "location" isEditable = {true} handler={(txt)=> setLocation(txt)} isEditing={isEditing}/>
                        <UserProp label = "Email" value = {email} id = "email" isEditable = {false} handler={null} isEditing={isEditing}/>
                        
                    </div>

                    <div className="col s12 m2">
                        {(!isEditing) &&
                            <Button
                              className="grey"
                              floating
                              icon={<Icon>edit</Icon>}
                              node="button"
                              waves="light"
                              tooltip="Edit Profile"
                               onClick={()=> setIsEditing(!isEditing) }
                            />
                        }
                    </div>
                </div>
                <ProfileButtons 
                        label={"Save"}
                        onCancel={props.onCancel}
                        okCallback={()=>saveProfile(props.onCreateDone)}
                    />
            </div>
        
        
        </>);
        }

}