import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import { storageRef } from "../services/firebase";
// import { getUserFromDb } from "../helpers/auth";
import { userTypes, createNewUser } from "../helpers/userMananagement";


class AdminProfile  extends Component {


}


function checkForm(formId)
{
    console.log("Check form");
    let form = document.getElementById(formId);
    if(form){
        if(form.classList.contains("needs-validation")){
            if (form.checkValidity()) {
                form.classList.add('was-validated')
                return true;
            }
        }
    }
    return false;
}

function clearForm(name)
{
    let form = document.getElementById(name);
    if(form){
        form.reset();
        if(form.classList.contains("was-validated")){
            form.classList.remove("was-validated");
        }
    }
}


class InstructorProfile extends Component {

    constructor(props) {
        super(props);    
        this.handleAddStudentChange = this.handleAddStudentChange.bind(this);
        this.handleAddStudent = this.handleAddStudent.bind(this);
        
        this.state = {
            
            addStudent: "",
            changed : {
                addStudent: false
            }
        }
    }



    handleAddStudentChange(event)
    {
        let changed = this.state.changed;
        let name = event.target.name;
        changed[name] = true;
        this.setState({
            [name]: event.target.value,
            changed: changed
        });

        if(event.target.value === ""){
            clearForm("addStudentForm");
        } else 
        if(checkForm("addStudentForm")){
            if(event.target.classList.contains("is-invalid")){
                event.target.classList.remove("is-invalid");
            }
        }
    }

    handleAddStudent(event)
    {
        
        // console.log(event);
        if(checkForm("addStudentForm"))
        {
            createNewUser(this.state.addStudent);
            clearForm("addStudentForm");
            // console.log("addStudent: ", this.state.addStudent);        
        }
        
        // if(validEmail(this.state.addStudent)){
            
        // }
        
    }

    render(){ 
        let name="addStudent";
        return (
            <form id="addStudentForm" className="needs-validation">
            <div className="input-group mb-3 has-validation">
            <span className="input-group-text " id={name+"_label"}>Add student</span>
            <input  id={name+"_input"}
                    type="email"
                    className="form-control"
                    placeholder="type student email"
                    aria-label="type student email"
                    aria-describedby="addStudentValidationFeedback"
                    onChange={this.handleAddStudentChange}
                    name={name}
                    required
                    />
            <button className="btn btn-primary" type="button"  onClick={this.handleAddStudent} >Add</button>
            <div id="addStudentValidationFeedback" className="invalid-feedback">Invalid email</div>
            </div>
            </form>
        );
    }
}

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
            <div className="input-group mb-3">
            <span className="input-group-text " id={id+"_label"}>{label}</span>
            {(value != null && isEditable && this.state.isEditing) ?
            <input  id={id+"_input"}
                    type="text"
                    className="form-control"
                    placeholder={value[id]}
                    aria-label={label}
                    onChange={handler}
                    defaultValue={value[id]}
                    name={id}
                    />
            :
            <span className="input-group-text " >{valueStr}</span>
            }
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

    addInstructorProfile(){
        if(this.state.dbUser !== null && this.state.dbUser.type !== userTypes.student) {
            return (<InstructorProfile ></InstructorProfile>)
        }
    }



    render() {
        return (
            <div className="container emp-profile">
                <div className="row">
                    <div className="col-md-4">
                        <div className="profile-img">
                            <img src={this.getPhotoUrl()} alt=""/>
                            <label htmlFor="photo-upload" className="custom-file-upload">Change Photo</label>
                            <input id="photo-upload" type="file" name="file" onChange={this.handleFileSelect}/>
                            

                        </div>
                    </div>
                    <div className="col-md-6">
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
                    <div className="col-md-2">
                        {!this.state.isEditing ?
                        <button className="profile-edit-btn"  onClick={this.editProfile} >Edit Profile</button>
                        :<>
                        <button className="btn btn-primary"  onClick={this.saveProfile} >Save Profile</button>
                        <button className="btn "  onClick={this.editProfile} >Cancel</button>
                        </>
                        }
                    </div>
                </div>
                <div className="row">
                    {this.addInstructorProfile()}
                </div>
            </div>
        )
    }
}
