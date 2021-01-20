import React, {  useRef, useEffect } from "react";

import { TextInput } from 'react-materialize';
import { auth, storageRef } from "../services/firebase";
import firebase from "firebase";

export function UploadImgButton(props) {
    const tooltipRef = useRef(null);
    useEffect(() => {
        if(!tooltipRef.current){
            let btnEl = document.querySelector('#UploadImageInput .input-field .btn');
            if(btnEl){
                btnEl.classList.add('btn-floating');
                btnEl.dataset.tooltip = "Upload image to your gallery"
                btnEl.dataset.position = "right"
                tooltipRef.current = window.M.Tooltip.init(btnEl, null);
            }
        }
        return ()=>{
            if(tooltipRef.current){tooltipRef.current.destroy(); tooltipRef.current = null; }
        }
    });
    return(<>
        <div id="UploadImageInput">
        <TextInput
        id="UploadImageTextInput"
        label=<i className="material-icons">file_upload</i>
        type="file"
       
        onChange={(evt)=>{
            evt.stopPropagation();
            evt.preventDefault();
            if (evt.target.files && evt.target.files.length) {
                uploadImg( evt.target.files[0], auth().currentUser.uid);
            }
        }
    }
    />
        </div>
    </>)
}



function uploadImg(file, userId){

// Create the file metadata
var metadata = {
  contentType: 'image/jpeg'
};

// Upload file and metadata to the object 'images/mountains.jpg'
var uploadTask = storageRef.child('images/'+ userId + '/' + file.name).put(file, metadata);

// Listen for state changes, errors, and completion of the upload.
uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
  function(snapshot) {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
      default: break;
    }
  }, function(error) {

  // A full list of error codes is available at
  // https://firebase.google.com/docs/storage/web/handle-errors
//   switch (error.code) {
//     case 'storage/unauthorized':
//       // User doesn't have permission to access the object
//       break;
// 
//     case 'storage/canceled':
//       // User canceled the upload
//       break;
// 
//     case 'storage/unknown':
//       // Unknown error occurred, inspect error.serverResponse
//       break;
//   }
}, function() {
  // Upload completed successfully, now we can get the download URL
  uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
    console.log('File available at', downloadURL);
  });
});
}