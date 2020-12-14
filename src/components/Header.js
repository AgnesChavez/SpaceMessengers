import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/firebase';

function ProfileButton()
{
  return (
    <div>
          <Link className="mr-3 profileButton" to="/profile">Profile</Link>
          <div className="mx-3 loggedInAs">
              Logged in as: <strong className="text-info">{auth().currentUser.email}</strong>
          </div>
    </div>

    );
}


function Header() {
  return (
    <header>
      <nav className="navbar navbar-expand-sm fixed-top header-nav">
        <Link className="navbar-brand" to="/">Space Messengers</Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNavAltMarkup">
          {auth().currentUser
            ? <div className="navbar-nav">
              <ProfileButton></ProfileButton>
              <button className="btn btn-primary mr-3 " onClick={() => auth().signOut()}>Logout</button>
            </div>
            : <div className="navbar-nav">
              <Link className="nav-item nav-link mr-3" to="/login">Log In</Link>
            </div>}
        </div>
      </nav>
    </header>
  );
}

export default Header;