import React, { Component } from "react";
import Header from "../components/Header";
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


export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth().currentUser,
            chats: [],
            content: '',
            readError: null,
            writeError: null,
            loadingChats: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.myRef = React.createRef();
    }

    async componentDidMount() {
        this.setState({ readError: null, loadingChats: true });
        const chatArea = this.myRef.current;
        try {
            // .orderBy('created', 'asc').limit(25)//where("", "==", "CA")
            db.collection("chats").orderBy('created', 'asc').limit(5)
                .onSnapshot(querySnapshot => {
                let chats = [];
                querySnapshot.forEach((snap) => {
                    chats.push(snap.data());
                });
                // chats.sort(function(a, b) { return a.timestamp - b.timestamp })
                this.setState({ chats });
                chatArea.scrollBy(0, chatArea.scrollHeight);
                this.setState({ loadingChats: false });
            });
        } catch (error) {
            this.setState({ readError: error.message, loadingChats: false });
        }
    }

    handleChange(event) {
        this.setState({
            content: event.target.value
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log("handleSubmit");
        this.setState({ writeError: null });

        try {
            let docRef = await db.collection("chats").add({
                content: this.state.content,
                history: [],
                timestamp: firebase.firestore.Timestamp.now(),
                created: firebase.firestore.FieldValue.serverTimestamp(),
                uid: this.state.user.uid,
                id: null,
                // group: this.state.group.id,
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
        <Header />

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
        <form onSubmit={this.handleSubmit} className="mx-3">
          <textarea className="form-control" name="content" onChange={this.handleChange} value={this.state.content}></textarea>
          {this.state.error ? <p className="text-danger">{this.state.error}</p> : null}
          <button type="submit" className="btn btn-submit px-5 mt-4">Send</button>
        </form>
        <div className="py-5 mx-3">
          Logged in as: <strong className="text-info">{this.state.user.email}</strong>
        </div>
      </div>
      </div>
        );
    }
}