import React, { useState,  useRef, useEffect } from "react";


import { auth, storageRef } from "../services/firebase";
import firebase from "firebase";

import { TextInput, Button, Modal } from 'react-materialize';

import { openModal, closeModal } from '../components/Modals';

import { addDataToDb } from '../helpers/db';

import { ImageData } from '../helpers/Types';

import { FileUploadButton } from '../components/FileUploadButton';


var uploadTasks = {};


async function onComplete(key, message, workshopId, downloadURL=""){
    if(key in uploadTasks){
        window.M.toast({html: message + uploadTasks[key].file.name, displayLength: 2500});
        let caption = uploadTasks[key].caption;
        let uploadPath = uploadTasks[key].uploadPath;
        delete uploadTasks[key];
        if(workshopId !== null && workshopId !== "" && downloadURL!==null && downloadURL !== ""){
            const { uid } = auth().currentUser;
            let newImage = ImageData(uid, workshopId, downloadURL, caption, uploadPath);
            addDataToDb("images" ,newImage, true, "id");
        }
        var event = new CustomEvent('uploadDone',{taskId: key});
        // Dispatch the event
        document.dispatchEvent(event);

    }
}

function uploadImg(file, userId, workshopId){
    let fileId = fileToString(file);
    if(!(fileId in uploadTasks) || uploadTasks[fileId] ===null){
        let uploadPath = 'images/'+ userId + '/' + file.name;
            
        uploadTasks[fileId] = {
            taskId: fileId,
            task:storageRef.child(uploadPath).put(file), 
            storageChild: storageRef.child(uploadPath), 
            uploadPath,
            file,
            caption: document.getElementById('TextInputModalUploadImageToBoard').value,
            workshopId

        };
        setUploadTaskListener(uploadTasks[fileId]);

        closeModal('ModalUploadImageToBoard');
    }
}

function setUploadTaskListener(taskData){
    taskData.listener = taskData.task.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        let currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes);
        // if(currentProgress !== progress ){setProgress(currentProgress);}

        // Create a new event
            var event = new CustomEvent('uploadProgressChange',{detail: {progress: currentProgress, taskId: taskData.taskId}});
            // console.log("uploadProgressChange " + currentProgress);
        // Dispatch the event
            document.dispatchEvent(event);

        // console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                // console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                // console.log('Upload is running');
                break;
            default : break;
        }
    },
    (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        // console.log("Error: " + error.code);
        onComplete(taskData.taskId, "File upload failed: ", null);
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
    async () => {
       let downloadURL = await taskData.storageChild.getDownloadURL();
        
        onComplete(taskData.taskId, "Succesfully uploaded file: ", taskData.workshopId, downloadURL);
    });
}



export function UploadImgButton(props) {
    // const tooltipRef = useRef(null);
    
    const [fileToUpload, setFileToUpload] = useState(null);
    const imgNeedToBeRead = useRef(false);

    const [numImage, setNumImage] = useState(0);

    function loadImg() {
        // console.log("loadImg_");
        if (fileToUpload && imgNeedToBeRead.current === true) {
            // console.log("loadImg");
            var reader = new FileReader();
            reader.onload = function (e) {
                // console.log("loadImg onLoad");
                let img = document.getElementById('ImgModalUploadImageToBoard');
                img.setAttribute('src', e.target.result);
                let modal = document.getElementById("ModalUploadImageToBoard");
                let footer = modal.querySelector('.modal-footer');
                let content = modal.querySelector('.modal-content');
                img.style.maxHeight=(modal.clientHeight - 200 - footer.clientHeight)+'px';
                img.style.maxWidth=content.clientWidth + 'px';
            }
            reader.readAsDataURL(fileToUpload);
            imgNeedToBeRead.current=false;
        }
    }

    function fileUploadButtonCallback(file){
        imgNeedToBeRead.current=true;
        setFileToUpload(file);
        openModal("ModalUploadImageToBoard");
    }

    function handleUploadDone(){
     setNumImage(numImage - 1);   
    }
    useEffect(() => {
        loadImg();
        
        document.addEventListener('uploadDone', handleUploadDone, false);
        
        return ()=>{
                // cons ole.log("destroy listener");
                document.removeEventListener('uploadDone', handleUploadDone, false);
            
        }
    });


    return(<>

        <FileUploadButton
        id="UploadImageInput"
        tootip="Upload image to your gallery"
        tooltipPosition="right"
        callback={(file)=>fileUploadButtonCallback(file)} 
    />

    <Modal
            actions={[      
                <Button 
                    node="button" 
                    waves="light" 
                    onClick={()=>{

                        uploadImg(fileToUpload, auth().currentUser.uid, props.workshopId);
                        setNumImage(numImage + 1);
                    }}
                >
                Upload
                </Button>,
                <Button flat modal="close" node="button" waves="red">Cancel</Button>
            ]}
            className="black-text"
            header="Upload image to your gallery"
            id="ModalUploadImageToBoard"
            root={document.getElementById('modalRoot')}
        > 
        <>

            <img id="ImgModalUploadImageToBoard" src="#" alt="to upload preview" />
            <TextInput
                id="TextInputModalUploadImageToBoard"
                label="Image Caption"
            />
        </>
    </Modal>


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
        {Object.entries(uploadTasks).map( task=> <FileUploader 
            key={task[0]} 
            taskId={task[0]} 
            file={task[1].file} 
            />) }
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


function FileUploader(props){
    
    const taskListener = useRef(null);

    const [progress, setProgress] = useState(0);

    function handleProgress(e){
        // console.log("handleProgress ", e.detail.taskId, props.taskId);
        if(e.detail.taskId === props.taskId){
            setProgress(e.detail.progress);
        }
    }

    useEffect(()=>{
        document.addEventListener('uploadProgressChange', handleProgress, false);
        
        return ()=>{
                // console.log("destroy listener");
                document.removeEventListener('uploadProgressChange', handleProgress, false);
            
        }
    });

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
