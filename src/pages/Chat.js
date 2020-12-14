import React, { Component } from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';

function formatTime(timestamp) {
    const d = timestamp.toDate();
    const time = `${d.getDate()}/${(d.getMonth()+1)}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    return time;
}

function Message(props) {
    return (
        <p className={"chat-bubble " + (props.uid === props.chat.uid ? "current-user" : "")}>
              {props.chat.content}
              <br />
              <span className="chat-time float-right">{formatTime(props.chat.timestamp)}</span>
            </p>
    );
}

function setMessageArea() {
    let headerHeight = document.querySelector("header").clientHeight;
    let chatContHeight = (window.innerHeight - headerHeight);
    document.querySelector(".spaceMessengersBg").style.height = chatContHeight + "px";
    document.querySelector(".chat-container").style.height = chatContHeight + "px";
    let messageInput = document.getElementById("messageInput");
    let marginBottom = 20;
    document.querySelector(".chat-area").style.height = (chatContHeight - messageInput.clientHeight - marginBottom) + "px";

    let sendButton = document.getElementById("sendButton");

    sendButton.style.height = (messageInput.clientHeight) + "px";



}

window.addEventListener('resize', setMessageArea);


export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth().currentUser,
            chats: [],
            content: '',
            readError: null,
            writeError: null,
            loadingChats: false,
            group: {id: "default"}
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.myRef = React.createRef();
    }

    

    async componentDidMount() {
        this.setState({ readError: null, loadingChats: true });
        const chatArea = this.myRef.current;
        try {
            // chatArea.style.height = (clientHeight - 60) + "px";
            setMessageArea();
            this.unsubscribe && this.unsubscribe();
            this.unsubscribe = db.collection("chats").where("group", "==", this.state.group.id).orderBy('created', 'desc').limit(15)
                .onSnapshot(querySnapshot => {
                    let chats = [];
                    querySnapshot.forEach((snap) => {
                        if(!snap.data().isComment)
                            chats.push(snap.data());
                    });
                    chats.reverse();
                    // chats.sort(function(a, b) { return a.timestamp - b.timestamp })
                    this.setState({ chats });
                    chatArea.scrollBy(0, chatArea.scrollHeight);
                    this.setState({ loadingChats: false });
                });
        } catch (error) {
            this.setState({ readError: error.message, loadingChats: false });
        }
    }

    componentWillUnmount()
    {
        if(this.unsubscribe){
            this.unsubscribe();
            console.log("this.unsubscribe();");
        }  
    } 

    handleChange(event) {
        this.setState({
            content: event.target.value
        });
    }

    async handleSubmit(event) {
        event.preventDefault();

        if(this.state.content === "" || this.state.content == null) return;

        // console.log("handleSubmit");
        this.setState({ writeError: null });

        try {
            let docRef = await db.collection("chats").add({
                content: this.state.content,
                history: [],
                timestamp: firebase.firestore.Timestamp.now(),
                created: firebase.firestore.FieldValue.serverTimestamp(),
                uid: this.state.user.uid,
                id: null,
                group: this.state.group.id,
                likedBy: [],
                numLikes: 0,
                isComment: false,
                comments: [],
                attachments: [],
                pullRequests: []
            });



            await db.collection("chats").doc(docRef.id).update({
                id: docRef.id
            });


            this.setState({ content: '' });
            const chatArea = this.myRef.current;
            chatArea.scrollBy(0, chatArea.scrollHeight);
            console.log("Document written with ID: ", docRef.id);
        } catch (error) {
            console.log("Error: ", error.message);
            this.setState({ writeError: error.message });
        }
    }



    render() {
        return (
            <div className="spaceMessengersBg">
            <div className="container-md chat-container">
        

        <div className="chat-area" ref={this.myRef}>
          {/* loading indicator */}
          {this.state.loadingChats ? <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
          </div> : ""}
          {/* chat area */}
          {this.state.chats.map(chat => {
            return (<Message key={chat.id} chat={chat} uid={this.state.user.uid} />);
          })}
        </div>
        
        
        <div id="messageInput" className="input-group mb-3">
        <textarea id="messageTxtArea" className="form-control" aria-label="With textarea" aria-describedby="sendButton" name="content" onChange={this.handleChange} value={this.state.content}></textarea>
        <button className="btn btn-primary btn-outline-primary" type="button" id="sendButton" onClick={this.handleSubmit} >Send</button> 
        </div>
        





      </div>
      </div>
        );
    }
}