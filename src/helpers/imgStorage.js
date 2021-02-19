import React, { useState,  useRef, useEffect } from "react";


import { auth, storageRef } from "../services/firebase";
import firebase from "firebase";

import { TextInput, Button, Modal } from 'react-materialize';

import { openModal, closeModal } from '../components/Modals';

import { addDataToDb } from '../helpers/db';

import { ImageData } from '../helpers/Types';

import { FileUploadButton } from '../components/FileUploadButton';

import  ImageBlobReduce  from 'image-blob-reduce';

  var reducer = new ImageBlobReduce({
    pica: ImageBlobReduce.pica({ features: [ 'js', 'wasm', 'ww' ] })
  });


    
function reduceSize(file, callback){
    reducer.toBlob(
          file,
          {
            max: 200,
            unsharpAmount: 80,
            unsharpRadius: 0.6,
            unsharpThreshold: 2
          }
        ).then((blob)=>callback(blob));    
  }


var uploadTasks = {};





async function onComplete(key, message, workshopId, downloadURL=null, isThumb = false){
    // console.log("onComplete(key: " + key + " message: " + message + " workshopId: " + workshopId + " downloadURL: " + downloadURL + " isThumb: " + isThumb);
    if(key in uploadTasks){
        if(downloadURL!==null){
            if(isThumb){
                uploadTasks[key].thumbURL = downloadURL;
            }else{
                uploadTasks[key].downloadURL = downloadURL;
            }
            if(uploadTasks[key].thumbURL === null || uploadTasks[key].downloadURL === null ){
                return;
            }
        }else{
            window.M.toast({html: message + uploadTasks[key].file.name, displayLength: 2500});
            delete uploadTasks[key];    
            return;
        }

        if(workshopId !== null && workshopId !== "" && downloadURL!==null && downloadURL !== ""){
            let caption = uploadTasks[key].caption;
            let uploadPath = uploadTasks[key].uploadPath;
    
            const { uid } = auth().currentUser;

            let newImage = ImageData(uid, workshopId, uploadTasks[key].thumbURL, uploadTasks[key].downloadURL, caption, uploadPath);
            
            // console.log("newImage:", newImage);

            addDataToDb("images" ,newImage, true, "id");
        }
        window.M.toast({html: message + uploadTasks[key].file.name, displayLength: 2500});
        
        delete uploadTasks[key]; 


        var event = new CustomEvent('uploadDone',{taskId: key});
        // Dispatch the event
        document.dispatchEvent(event);

    }
}

function uploadImg(file, userId, workshopId){
    let fileId = fileToString(file);
    if(!(fileId in uploadTasks) || uploadTasks[fileId] ===null){
        let uploadPath = 'images/'+ userId + '/' + file.name;
        
        let thumbUploadPath =  'images/'+ userId + "/thumb_"+ file.name; 

        

        uploadTasks[fileId] = {
            taskId: fileId,
            storageChild: storageRef.child(uploadPath), 
            storageChildThumb: storageRef.child(thumbUploadPath), 
            uploadPath,
            file,
            downloadURL:null,
            thumbURL:null,
            caption: document.getElementById('TextInputModalUploadImageToBoard').value,
            workshopId
        };
        
        uploadTasks[fileId].task = storageRef.child(uploadPath).put(file);
        uploadTasks[fileId].listener =  setUploadTaskListener(uploadTasks[fileId], false);

        reduceSize(file, (blob)=>{
            uploadTasks[fileId].taskThumb = storageRef.child(thumbUploadPath).put(blob);
            uploadTasks[fileId].thumbListener =  setUploadTaskListener(uploadTasks[fileId], true);
        });

        closeModal('ModalUploadImageToBoard');
    }
}

function setUploadTaskListener(taskData, isThumb){

    let taskListener = (isThumb?taskData.taskThumb:taskData.task).on(firebase.storage.TaskEvent.STATE_CHANGED, 
    (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        let currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes);

            var event = new CustomEvent('uploadProgressChange',{detail: {progress: currentProgress, taskId: taskData.taskId, isThumb}});
            document.dispatchEvent(event);
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                break;
            default : break;
        }
    },
    (error) => {
        onComplete(taskData.taskId, "File upload failed: ", null);
    },
    async () => {
        let downloadURL;
        if(isThumb){
            downloadURL = await taskData.storageChildThumb.getDownloadURL();
        }else{
            downloadURL = await taskData.storageChild.getDownloadURL();
        }
        onComplete(taskData.taskId, "Succesfully uploaded file: ", taskData.workshopId, downloadURL, isThumb);
    });
    return taskListener;
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



//this is the widget that shows at the bottom of the page with the progress bar
function FileUploader(props){
    
    const [progress, setProgress] = useState(0);
    const [thumbProgress, setThumbProgress] = useState(0);

    function handleProgress(e){
        // console.log("handleProgress ", e.detail.taskId, props.taskId);
        if(e.detail.taskId === props.taskId){
            if(e.detail.isThumb === true){
                setProgress(e.detail.progress);
            }else{
                setThumbProgress(e.detail.progress);
            }
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
                <div className="determinate" style={{width:  ((progress + thumbProgress) *50) + "%"}}  ></div>
            </div>
        </div>
    </>);
}
