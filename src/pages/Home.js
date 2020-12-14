import React, { Component } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

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
                <Link className="btn btn-primary px-5 mr-3" to="/login">Login to Your Account</Link>
              </div>
            </div>
          </div>
        </section>
        <Footer></Footer>
      </div>
    )
  }
}
