import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from "../services/firebase";
import Footer from "../components/Footer";
import { randomColorHSL } from "../helpers/Types.js"

export default function HomePage(props) {
    useEffect(() => {
        document.querySelector('header').style.display='none';
    });

    let randCol = randomColorHSL();

    return (
        <>
        <div className="home">
            <section>
                <div className="spaceMessengersBg" >
                    <div className="container">
                        <h1 className="">SPACE BOARD</h1>
                        <h5 className="">A collaborative platform for sci-art communication</h5>
                        {/* <div style={{marginTop: "100px"}}> */}
                            {/* <Link className="btn waves-effect waves-light btn" to={(auth().currentUser?"/board":"/login")}>Login to Your Account</Link> */}
                        {/* </div> */}
                        <div className="row" id="LoginButtonContainer">
                            <div className="col s12 m6">
                                <Link className="btn waves-effect waves-light btn loginButton" style={{backgroundColor: randCol}} to={(auth().currentUser?"/board":"/login")}>Login to Your Account</Link>

                                <div className="card black loginInfo" style={{borderColor: randCol}} >
                                    <div className="card-content white-text">
                                        <p>SPACE BOARD is a collaborative space for STEMarts Lab workshops and sci-art collaborations that allows for interactive exchange and data sharing. The platform includes a chat room, gallery and customizable boards to share messages and images in real time. Visit <a href="www.spacemessengers.com">Space Messengers</a> to see how the Space Board is being used for a youth workshop and sci-art installation.</p>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </section>
        </div>
        <Footer />
        </>
    )
}
