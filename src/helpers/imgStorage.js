import React, { useState,  useRef, useEffect } from "react";


import { auth, storageRef } from "../services/firebase";
import firebase from "firebase";

import { TextInput, Button, Modal } from 'react-materialize';

import { openModal, closeModal } from '../components/Modals';

import { addDataToDb } from '../helpers/db';

import { ImageData } from '../helpers/Types';

var uploadTasks = {};


// export function deleteImg(imgPath){
//     storageRef.child(imgPath).delete().then(() => {
//   
//     }).catch((error) => {
//         console.log("error deleting file", error);
//     });
// }


export function FileUploadButton(props){

    const tooltipRef = useRef(null);
    const divRef= useRef(null);
    useEffect(() => {
        // console.log("UploadImgButton constructor");
        if(!tooltipRef.current && divRef.current){
            let btnEl = divRef.current.querySelector('.input-field .btn');
            if(btnEl){
                btnEl.classList.add('btn-floating');
                btnEl.dataset.tooltip = props.tootip;
                btnEl.dataset.position = props.tooltipPosition;
                tooltipRef.current = window.M.Tooltip.init(btnEl, null);
            }
        }
        return ()=>{
            // console.log("UploadImgButton destructor");
            if(tooltipRef.current){tooltipRef.current.destroy(); tooltipRef.current = null; }
        }
    });

    return(<>
        <div ref={divRef} id={props.id}>
            <TextInput
                label=<i className="material-icons">file_upload</i>
                type="file"                
                onChange={(evt)=>{
                    evt.stopPropagation();
                    evt.preventDefault();
                    if (evt.target.files && evt.target.files.length) {
                      props.callback(evt.target.files[0]);
                    }
                }}
            />
        </div>
    </>);
}



export function UploadImgButton(props) {
    // const tooltipRef = useRef(null);
    
    const [numUploads, setNumUploads] = useState(0);
    const [fileToUpload, setFileToUpload] = useState(null);
    const imgNeedToBeRead = useRef(false);

    function uploadImg(file, userId){
        let fileId = fileToString(file);
        if(!(fileId in uploadTasks) || uploadTasks[fileId] ===null){
            let uploadPath = 'images/'+ userId + '/' + file.name;
            
            uploadTasks[fileId] = {
                task:storageRef.child(uploadPath).put(file), 
                storageChild: storageRef.child(uploadPath), 
                uploadPath,
                file,
                caption: document.getElementById('TextInputModalUploadImageToBoard').value
            };
            setNumUploads(numUploads + 1);
            closeModal('ModalUploadImageToBoard');
        }
    }


    async function onComplete(key, message, downloadURL=""){
        if(key in uploadTasks){
            window.M.toast({html: message + uploadTasks[key].file.name, displayLength: 2500});

            let caption = uploadTasks[key].caption;
            let uploadPath = uploadTasks[key].uploadPath;
            // let url = await uploadTasks[key].storageChild.getDownloadURL();
            delete uploadTasks[key];
            setNumUploads(numUploads - 1);    

            if(downloadURL!==null && downloadURL !== ""){
                // console.log("downloadURL: " + downloadURL);
                // console.log("url: " + url);
                
                // props.uploadSuccess({downloadURL, caption, uploadPath});

                const { uid } = auth().currentUser;

                let newImage = ImageData(uid, props.workshopId, downloadURL, caption, uploadPath);
        
                addDataToDb("images" ,newImage, true, "id");

            }
        }
    }




    function loadImg() {
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

    useEffect(() => {
        loadImg();
    });

    // uploadImg(file, auth().currentUser.uid)}
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
                    onClick={()=>uploadImg(fileToUpload, auth().currentUser.uid)}
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
            task={task[1].task}
            storageChild={task[1].storageChild}
            onComplete={onComplete}/>) }
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

 // Upload completed successfully, now we can get the download URL
    async function uploadSucceded(){

        let downloadURL = await props.storageChild.getDownloadURL();
        // console.log('File available at', downloadURL);
        props.onComplete(props.taskId, "Succesfully uploaded file: ", downloadURL);
        
//          file.makePublic(function(err, apiResponse) {
//         });

// 
//         console.log("uploadSucceded task",props.task);
//         try{
//             let metadata = await props.task.snapshot.ref.getMetadata();
//             // console.log("metadata",metadata)
//             let url = await storageRef.child(metadata.fullPath).getDownloadURL();
//             
//             props.onComplete(props.taskId, "Succesfully uploaded file: ", url); 
//             
//         }catch(error) {
//             console.error('failed getting file download url', error);
//             props.onComplete(props.taskId, "Failed to uploaded file: " + error);
//         }

    }

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
                   uploadSucceded();
                });
            }
            return ()=>{
                console.log("destroy listener");
                if(taskListener.current!==null) taskListener.current();
                    uploadSucceded();
                    // props.onComplete(props.taskId, "Succesfully uploaded file: ");
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
