import React, { Component } from 'react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { auth } from "../services/firebase";
export default class HomePage extends Component {
  render() {
    return (
      <div className="home">
        <section>
          <div className="jumbotron jumbotron-fluid py-5 spaceMessengersBg" >
            <div className="container text-center py-5">
              <h1 className="display-4">Welcome to Space Messengers</h1>
              <p className="lead">A mixed reality projection and youth workshop</p>
              <div className="mt-4">
                <Link className="btn btn-primary px-5 mr-3" to={(auth().currentUser?"/board":"/login")}>Login to Your Account</Link>
              </div>
            </div>
          </div>
        </section>
        <Footer></Footer>
      </div>
    )
  }
}
