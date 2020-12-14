import React, { Component } from 'react';
import { auth } from "../services/firebase";
import { db } from "../services/firebase";



function checkForm(formId)
{
    // console.log("Check form");
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


export default  class EmailField extends Component {

    constructor(props) {
        super(props);    
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        
        this.state = {
            email: "",

        }
    }



    handleChange(event)
    {
        
        let name = event.target.name;
        
        this.setState({
            email: event.target.value,
        });

        if(event.target.value === ""){
            clearForm("emailForm");
        } else 
        if(checkForm("emailForm")){
            if(event.target.classList.contains("is-invalid")){
                event.target.classList.remove("is-invalid");
            }
        }
    }

    handleClick(event)
    {
        if(checkForm("emailForm"))
        {
            // createNewUser(this.state.email);
            // 
            this.props.onClick(this.state.email);
            clearForm("emailForm");
            // console.log("email: ", this.state.email);        
        }
    }

    render(){ 
        let name="email";
        return (
            <form id="emailForm" className="needs-validation">
            <div className="input-group mb-3 has-validation">
            <span className="input-group-text " id={name+"_label"}>Add student</span>
            <input  id={name+"_input"}
                    type="email"
                    className="form-control"
                    placeholder="type student email"
                    aria-label="type student email"
                    aria-describedby="emailValidationFeedback"
                    onChange={this.handleChange}
                    name={name}
                    required
                    />
            <button className="btn btn-primary" type="button"  onClick={this.handleClick} >Add</button>
            <div id="emailValidationFeedback" className="invalid-feedback">Invalid email</div>
            </div>
            </form>
        );
    }
}