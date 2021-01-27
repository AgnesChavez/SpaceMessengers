import React, { useState,  useRef, useEffect } from "react";

import { TextInput } from 'react-materialize';
import { auth, storageRef } from "../services/firebase";
import firebase from "firebase";

import { Modal } from 'react-materialize';




var uploadTasks = {};

export function UploadImgButton(props) {
    const tooltipRef = useRef(null);
    
    const [numUploads, setNumUploads] = useState(0);


    useEffect(() => {
        // console.log("UploadImgButton constructor");
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
            // console.log("UploadImgButton destructor");
            if(tooltipRef.current){tooltipRef.current.destroy(); tooltipRef.current = null; }
        }
    });


    function uploadImg(file, userId){
        let fileId = fileToString(file);
        if(!(fileId in uploadTasks) || uploadTasks[fileId] ===null){
            let uploadPath = 'images/'+ userId + '/' + file.name;
            
            uploadTasks[fileId] = {task:storageRef.child(uploadPath).put(file), file};
            setNumUploads(numUploads + 1);
            
        }
    }


    function onComplete(key, message){
        if(key in uploadTasks){
            window.M.toast({html: message + uploadTasks[key].file.name, displayLength: 2500});

            delete uploadTasks[key];
            setNumUploads(numUploads - 1);       
        }
    }
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
                      // console.log(evt.target.files[0]);
                        uploadImg( evt.target.files[0], auth().currentUser.uid);
                    }
                }}
            />
            </div>    

    {(Object.keys(uploadTasks).length > 0)?
    <Modal
        actions={[ ]}
        bottomSheet
        fixedFooter={false}
        id="ModalUploads"
        open={true}
        options={{
            dismissible: false,
            endingTop: '10%',
            inDuration: 250,
            onCloseEnd: null,
            onCloseStart: null,
            onOpenEnd: null,
            onOpenStart: null,
            opacity: 0.0,
            outDuration: 250,
            preventScrolling: true,
            startingTop: '4%'
        }}
        root={document.getElementById("UploadsModal")}
        >
        <div className="uploadsContent">
        <p>Uploads</p>
        {Object.entries(uploadTasks).map( task=> <FileUploader key={task[0]} taskId={task[0]} file={task[1].file} task={task[1].task} onComplete={onComplete}/>) }
        </div>
        </Modal>
        :""}
    </>)
}




function fileToString(file){
    return file.name + "_" + 
           file.lastModified  + "_" + 
           file.size  + "_" + 
           file.type;
}




//props
// file
// task
function FileUploader(props){

    // var metadata = {contentType: 'image/jpeg'};

    
    const taskListener = useRef(null);

    const [progress, setProgress] = useState(0);

    useEffect(()=>{
        if(taskListener.current === null){
            // console.log("make listenre");
            taskListener.current = props.task.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
                (snapshot) => {
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    let currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes);
                    if(currentProgress !== progress ){setProgress(currentProgress);}
                    // console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED: // or 'paused'
                            console.log('Upload is paused');
                            break;
                        case firebase.storage.TaskState.RUNNING: // or 'running'
                            console.log('Upload is running');
                            break;
                        default : break;
                    }
                },
                (error) => {
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    console.log("Error: " + error.code);
                    props.onComplete(props.taskId, "File upload failed: ");
                //     switch (error.code) {
                //         case 'storage/unauthorized':
                //             // User doesn't have permission to access the object
                //             break;
                //         case 'storage/canceled':
                //             // User canceled the upload
                //             break;
                // 
                //             // ...
                // 
                //         case 'storage/unknown':
                //             // Unknown error occurred, inspect error.serverResponse
                //             break;
                //     }
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    props.task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                        // console.log('File available at', downloadURL);
                        props.onComplete(props.taskId, "Succesfully uploaded file: ");
                    });
                });
            }
            return ()=>{
                // console.log("destroy listener");
                if(taskListener.current!==null) taskListener.current();
                    props.onComplete(props.taskId, "Succesfully uploaded file: ");
            }
        }
    );

    
    return (<>
        <div className="FileUploaderWidget">
            <p>
                Uploading file: {props.file.name}
            </p>
            <div className="progress">
                <div className="determinate" style={{width:  (progress *100) + "%"}}  ></div>
            </div>
        </div>
    </>);
}
