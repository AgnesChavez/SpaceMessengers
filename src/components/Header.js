import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/firebase';

import { Navbar, NavItem, Icon } from 'react-materialize';

// function ProfileButton()
// {
//   return (
//     <div>
//           <Link className="mr-3 profileButton" to="/profile">Profile</Link>
//           <div className="mx-3 loggedInAs">
//               Logged in as: <strong className="text-info">{auth().currentUser.email}</strong>
//           </div>
//     </div>
// 
//     );
// }


function Header() {
  return (<>
    <header>
<Navbar
  alignLinks="right"
  brand={<a className="brand-logo" href="#">Space Messengers</a>}
  id="mobile-nav"
  menuIcon={<Icon>menu</Icon>}
  options={{
    draggable: false,
    edge: 'left',
    inDuration: 250,
    onCloseEnd: null,
    onCloseStart: null,
    onOpenEnd: null,
    onOpenStart: null,
    outDuration: 200,
    preventScrolling: true
  }}
>
{auth().currentUser
            ? <><div>
            <Link className="profileButton" to="/profile">Profile</Link>
            <div className="loggedInAs">
              Logged in as: <strong className="text-info">{auth().currentUser.email}</strong>
            </div>
            </div>
              <NavItem  onClick={() => auth().signOut()}>Logout</NavItem>
              </>
            :<NavItem href="/login">Log In</NavItem> 
            }
</Navbar>
    </header>
    
  </>);
}

export default Header;