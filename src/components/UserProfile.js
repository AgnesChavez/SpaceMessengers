import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import { storageRef } from "../services/firebase";
// import { getUserFromDb } from "../helpers/auth";
// import { createNewUser } from "../helpers/userManagement";
// import { userTypes } from "../helpers/Types";
// import { WorkshopData } from "../helpers/Types";


// import { Workshop } from "../helpers/WorkshopsWithHooks";

import { Button, Icon, Toast } from 'react-materialize';
// import { addDataToDb } from '../helpers/db'



// function createToast(msg)
// {
//     return (
//         <Toast
//             options={{
//                 html: msg,
//                 displayLength: 2000
//             }} 
//             />
//         );
// }


export default class UserProfile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: auth().currentUser,
            dbUser: null,
            isEditing: false,
            changed: {
                displayName: false,
                bio: false,
                location: false,
                type: false,
            }
        };
        
        this.editProfile = this.editProfile.bind(this);
        this.userProp = this.userProp.bind(this);
        this.saveProfile = this.saveProfile.bind(this);
        this.updateUserDb = this.updateUserDb.bind(this);
        
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeUser = this.handleChangeUser.bind(this);
        this.handleChangeDbUser = this.handleChangeDbUser.bind(this);
        
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.getPhotoUrl = this.getPhotoUrl.bind(this);
        
    }
    componentDidMount() {
        
        let uid = auth().currentUser.uid;

        db.collection("users").doc(uid).get()
        .then(user => {
            if(user.exists){
                this.setState({ dbUser: user.data()});
            }else
            {
                console.log("User ", uid, "does not exist");
            }     
        }).catch(error=>{
            console.error("Error retrieving user: ", uid, "  error: ", error);
        });
        // console.log(this.state.dbUser);
    }

    

    userProp(label, value, id, isEditable, handler) {

        let valueStr = ""
        if(value != null)
        {
            valueStr = value[id];
        }

        return (

            <div className="row">    
            <div className="col s12 grey-text text-darken-4">
            <span style={{marginRight: 10 + 'px'}} className="" id={id+"_label"}>{label}</span>
            {(value != null && isEditable && this.state.isEditing) ?
            <div className="input-field inline">
            <input  id={id+"_input"}
                    type="text"
                    placeholder={value[id]}
                    aria-label={label}
                    onChange={handler}
                    defaultValue={value[id]}
                    name={id}
                    />
            </div>
            :
            <span className="input-group-text " >{valueStr}</span>
            }
            </div>
            </div>
        );
    }

    updateUserDb(name, value)
    {
        // console.log(name , this.state.changed[name]);
        
        if(this.state.changed[name]){
            let state = {
            bio: this.state.dbUser.bio,
            location: this.state.dbUser.location,
            };
            // console.log(state);
        db.collection("users").doc(this.state.user.uid).set(state, { merge: true })
        .then(function() {

            console.log("successfully updated " + name);
        })
        .catch(function(error) {
            console.error("Error creating user: ", error);
        });
            let changed = this.state.changed;
            changed[name] = false;
            this.setState({changed});
        }
    }

    saveProfile(event) {
        event.preventDefault();   
        
        this.updateUserDb("bio", this.state.dbUser.bio);
        this.updateUserDb("location", this.state.dbUser.location);

        if(this.state.changed["displayName"]){
            auth().currentUser.updateProfile({
                displayName: this.state.user.displayName
            }).then(function() {
              // Update successful.
            }).catch(function(error) {
              // An error happened.
            });
        }
        
        this.setState({ isEditing : false });
    }
    

    editProfile(event) {
        event.preventDefault();
        if(this.state.isEditing){
            this.setState({ isEditing : false });    
        }else{
            this.setState({ isEditing : true });
        }
    }

    handleChange(event, objName)
    {
        let changed = this.state.changed;
            changed[event.target.name] = true;
            let obj = this.state[objName];
            obj[event.target.name] = event.target.value;
        this.setState({
            [objName]: obj,
            changed: changed
        });
    }

    handleChangeUser(event) {
        this.handleChange(event, "user");
    }

    handleChangeDbUser(event) {
        this.handleChange(event, "dbUser");
    }
    
    async handleFileSelect(evt) {
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
    
            let uid = this.state.user.uid;
            try {
                let snapshot = await storageRef.child('usersAvatar/' + uid + '.' + ext).put(evt.target.files[0]);
    
                console.log('Uploaded', snapshot.totalBytes, 'bytes.');
                console.log('File metadata:', snapshot.metadata);
                // Let's get a download URL for the file.
                let url = await snapshot.ref.getDownloadURL();
    
                await db.collection("users").doc(uid).update({
                    photoURL: url
                });
                let user = this.state.dbUser;
                user.photoURL = url;
                this.setState({dbUser: user});
    
            } catch (error) {
                console.log('Upload failed:', error);
            }
        }
    }

    getPhotoUrl()
    {
        if(this.state.dbUser != null && this.state.dbUser.photoURL != null){
          return this.state.dbUser.photoURL;  
        }else{
          return this.state.user.photoURL;  
        } 
    }

    render() {
        return (
            <div >
                <div className="row">
                    <div className="col s12 m4">
                        <div className="profile-img">
                            <img src={this.getPhotoUrl()} alt=""/>
                            <label htmlFor="photo-upload" className="custom-file-upload">Change Photo</label>
                            <input id="photo-upload" type="file" name="file" onChange={this.handleFileSelect}/>
                            

                        </div>
                    </div>
                    <div className="col s12 m6">
                        <div className="profile-head">
                                <h5>
                                    {this.state.user.displayName}
                                </h5>
                                <h6>
                                    
                                </h6>
                        </div>
                        { this.state.isEditing ? 
                             this.userProp("Name",  this.state.user , "displayName", true, this.handleChangeUser ):""
                        }
                        { this.userProp("Bio",  this.state.dbUser , "bio", true, this.handleChangeDbUser)}
                        { this.userProp("Location",  this.state.dbUser, "location", true, this.handleChangeDbUser)}
                        { this.userProp("Type",  this.state.dbUser, "type", false, null)}
                        
                        { this.userProp("Email",  this.state.user, "email", false, null)}
                        { this.userProp("User Id", this.state.user, "uid", false, null)}

                    </div>

{/*                         <Button */}
{/*                               className="grey" */}
{/*                               floating */}
{/*                               icon={<Icon>add_circle_outline</Icon>} */}
{/*                               node="button" */}
{/*                               waves="light" */}
{/*                               tooltip="Edit Profile" */}
{/*                               onClick={()=>addDataToDb("workshops",WorkshopData(), true, "id")} */}
{/*  */}
{/*  */}
{/*                         /> */}
                    

                    <div className="col s12 m2">
                        {!this.state.isEditing ?
                            <Button
                              className="grey"
                              floating
                              icon={<Icon>edit</Icon>}
                              node="button"
                              waves="light"
                              tooltip="Edit Profile"
                               onClick={this.editProfile}
                            />
                        :<>
                        <div className="row">
                        <Button node="button" waves="light" onClick={this.saveProfile} >Save Profile</Button>
                        </div>
                        <div className="row">
                        <Button node="button" waves="light" className="white black-text"  onClick={this.editProfile} >Cancel</Button>
                        </div>
                        </>
                        }
                    </div>
                </div>
                {/* <div className="row"> */}
                {/*     <Workshop></Workshop> */}
                {/* </div> */}
            </div>
        )
    }
}
