import React, { Component } from 'react';
import { auth } from "../services/firebase";
import { createUserInDb } from "../helpers/userMananagement";
import { Link } from 'react-router-dom';

export default class CompleteRegistration extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            email: window.localStorage.getItem('emailForSignIn'),
            completingRegistration: false,
            requestingEmail: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.verifyRegistration = this.verifyRegistration.bind(this);
    }



    async verifyRegistration() {
        this.setState({ error: null, completingRegistration: true });
        // Confirm the link is a sign-in with email link.
        if (auth().isSignInWithEmailLink(window.location.href)) {
            // Additional state parameters can also be passed via URL.
            // This can be used to continue the user's intended action before triggering
            // the sign-in operation.
            // Get the email if available. This should be available if the user completes
            // the flow on the same device where they started it.
            // var email = window.localStorage.getItem('emailForSignIn');
            if (!this.state.email) {

              this.setState({ requestingEmail: true, completingRegistration: false });

              return;
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask the user to provide the associated email again. For example:
            }
            // The client SDK will parse the code from the link for you.
            try {
                let result = await auth().signInWithEmailLink(this.state.email, window.location.href).get();
                if (result) {
                    // Clear email from storage.
                    window.localStorage.removeItem('emailForSignIn');
                    this.setState({ completingRegistration: false });

                    if (result.additionalUserInfo.isNewUser) {
                        await createUserInDb(result.user.uid);
                    }
                    // You can access the new user via result.user
                    // Additional user info profile not available via:
                    // result.additionalUserInfo.profile == null
                    // You can check if the user is new or existing:
                    // result.additionalUserInfo.isNewUser
                }
            } catch (error) {
                this.setState({ error: error, completingRegistration: false });
                // Some error occurred, you can inspect the code: error.code
                // Common errors could be invalid email and invalid or expired OTPs.
            }
        }
    }

    async componentDidMount() {
        this.verifyRegistration();
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({ error: null, requestingEmail:false });
        try {
            this.verifyRegistration();

        } catch (error) {
            this.setState({ error: error, requestingEmail:true });
        }
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }
render() {
        return (

     <div className="container">
                <h1>
            Login to
            <Link className="title ml-2" to="/">
              Space Messengers
            </Link>
          </h1>
          {this.state.error ? (
              <p className="text-danger">{this.state.error}</p>
            ) : null}
          {this.state.requestingEmail ? 
        <form
          className="mt-5 py-5 px-5"
          autoComplete="off"
          onSubmit={this.handleSubmit}
        >
          <p className="lead">
            Please write your email address to finish your registration.
            <br/>
              It must be the exact same email address where you received your registration link.
          </p>
          <div className="form-group">
            <input
              className="form-control"
              placeholder="Email"
              name="email"
              type="email"
              onChange={this.handleChange}
              value={this.state.email}
            />
          </div>
          <div className="form-group">
            <button className="btn btn-primary px-5" type="submit">Send</button>
          </div>
        </form>
        : ""}
        {this.state.completingRegistration ? <div className="spinner-border text-success" role="status">
            <span className="sr-only">Verifying...</span>
          </div> : ""}
      </div>

        );
    }

}