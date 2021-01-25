import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from "../services/firebase";
export default function HomePage(props) {
    useEffect(() => {
        document.querySelector('header').style.display='none';
    });
    return (
        <div className="home">
            <section>
                <div className="spaceMessengersBg" >
                    <div className="container">
                        <h1 className="">Welcome to Space Messengers</h1>
                        <h5 className="">A mixed reality installation and youth workshop</h5>
                        <div style={{marginTop: "100px"}}>
                            <Link className="btn waves-effect waves-light btn" to={(auth().currentUser?"/board":"/login")}>Login to Your Account</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
