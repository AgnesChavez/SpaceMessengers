import React, { Component, useRef, useState} from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';


// import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon, Button, Row, Col, Card, CardTitle, CardPanel } from 'react-materialize';

import { formatTime } from '../helpers/Formatting'

import { BoardMessageData } from '../helpers/Types'
import { BoardMessage } from '../components/BoardMessage'

import '../css/board.css';




export default function Board() {

    const myRef = useRef();
    const boardId = "default";

    const messagesRef = db.collection("boardMessages");

    const [messages, msgReady, msgError] = useCollectionData(messagesRef.where("boardId", "==", boardId));

    const [selected, setSelected ] = useState(null);

    const addMessage = async (e) => {
        e.preventDefault();
        console.log("addMessage");
        const { uid } = auth().currentUser;

        let msgRef = await messagesRef.add(BoardMessageData(uid, boardId));

        await messagesRef.doc(msgRef.id).update({
            id: msgRef.id
        });
    }


    const onStopHandler = (msgId, position) => {
        messagesRef.doc(msgId).update({
            position: {
                x: position.x,
                y: position.y
            }
        });
    }

    const onClick = (evt) =>
    {
        if( evt.target === myRef.current)
        {
            setSelected(null);
        }else
        {
            setSelected(evt.target);
        }
    }

    return ( <>
        <Row>
            <div ref={myRef} id="board" 
                className="col s12 z-depth-2 grey darken-4  "
                onClick={onClick}
                >
                <Button
                    className="red right"
                    floating
                    icon={<Icon>add</Icon>}
                    node="button"
                    waves="light"
                    onClick={addMessage}
                    tooltip="Click to add a new message"
                />  

                { messages && messages.map(msg => <BoardMessage
                                                    key={msg.id}  
                                                    message={msg} 
                                                    onStopHandler={onStopHandler} 
                                                    selected={selected}
                                                     />)}
      
            </div>
        </Row> 
    </>)
}
