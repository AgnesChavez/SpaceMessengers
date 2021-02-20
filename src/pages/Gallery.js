
import React,  { useState, useEffect } from "react";

import { CenteredPreloader } from '../components/CenteredPreloader'

import { useCollectionData } from 'react-firebase-hooks/firestore';

import { auth, storageRef, db } from "../services/firebase";

import '../css/gallery.css';

import { Icon, Button, Modal, TextInput } from 'react-materialize';

import { Link } from 'react-router-dom';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { userTypes } from "../helpers/Types"

import { openModal, closeModal } from '../components/Modals';

// function getWidth() {
//   	return Math.max(
//     document.body.scrollWidth,
//     document.documentElement.scrollWidth,
//     document.body.offsetWidth,
//     document.documentElement.offsetWidth,
//     document.documentElement.clientWidth
// 	);
// }

function deleteImg(img){
	storageRef.child(img.imagePath).delete().then(() => {
  
	}).catch((error) => {
  		console.log("error deleting file", error);
	}); 

	db.collection("images").doc(img.id).delete().then(function() {
             
    }).catch(function(error) {
            console.error("Error removing document: ", error);
	});
}




export default  function Gallery(props) {

	let [user, loadingUser ] = useDocumentData(db.collection('users').doc(auth().currentUser.uid));


    return (<>
    	<header id="GalleryHeader">
      		<h4>Space Messengers Gallery</h4>
      		 <Link to={"/board"} >
				<Button
    				className=""
    				node="button"
    				small
    				tooltip="go back to boards"
    				waves="light"
    				floating
  					icon={<Icon>arrow_back</Icon>}
    			/>
			</Link>

    	</header>
    	<div id="galleryBg"/>
    	<div className="gallery"> 
    	{user && !loadingUser && <RenderGallery showUserGallery={true} user={user}/>}
    	{user && !loadingUser && <RenderGallery showUserGallery={false} user={user}/>}
    	</div>
    	</>)

}


function createMediaBox(imgId, src, thumbSrc){
	// console.log("createMediaBox ", imgId);
	
	var elem = document.getElementById(imgId);
	if(elem){
		elem.src = src;

		let instance = window.M.Materialbox.getInstance(elem);
    	if(instance ) {
    		instance.close();
    		return;
    	}
    	elem.classList.remove("galleryImg");
    	var box = window.M.Materialbox.init(elem, 
    		{onCloseStart: ()=> { 
    			if(thumbSrc) elem.src = thumbSrc;
    				document.getElementById(imgId).classList.add("galleryImg");
    			},
    		 onCloseEnd: ()=> { 
    		 	console.log("media box closed");
    		 	let instance = window.M.Materialbox.getInstance(elem);
    		 	if(instance) {
    		 		console.log("media box instance destroyed");
    		 		instance.destroy();
    		 	}
    		 }
    		});
    	box.open();

    	let captions = document.querySelector(".materialbox-caption");
    	if(captions){
    		captions.style.lineHeight = "unset";
    		captions.style.height = "unset";
    	}

	}else{
		console.log("createMediaBox failed: imageId " + imgId + " does not exist");
	}


}


const state_deleting = "state_deleting";
const state_editing = "state_editing";
const state_idle = "state_idle";

function EditCaption(props){

	return <Button
    	className="red right removeImageButton"
    	node="button"
    	small
    	tooltip="Edit this image's caption"
    	waves="light"
    	floating
  		icon={<Icon>edit</Icon>}
  		onClick={()=> props.setImgToEdit(props.img)}
  		/>
    	

}




//img
//deleting
//deleteCallback
//user
function ShowImg(props){
	
	let thisId = (props.showUserGallery===true?"user_":"")+props.img.id;

	return (<>
		<li>
			<img 
				id={thisId}
				alt={props.img.caption}
				src={ props.img.thumbURL ||  props.img.downloadURL}
				data-caption={props.img.caption}
				className=" materialboxed galleryImg"
				onClick={(e)=>
							{
								if(e.target.id === thisId){
									createMediaBox(thisId, props.img.downloadURL, props.img.thumbURL);
								}
							}
						}
			/>
				
			{ props.state === state_deleting && 
				<Button
    				className="red right removeImageButton"
    				node="button"
    				small
    				tooltip="Delete this image"
    				waves="light"
    				floating
  					icon={<Icon>delete</Icon>}
  					onClick={()=>props.deleteCallback(props.img)}
    		/>}
    		{ props.state === state_editing && 
    			<EditCaption img={props.img} setImgToEdit={props.setImgToEdit} />	
			}
		</li>
	</>)    	
}



function SetStateButton(props){
	return <Button
   			className="grey darken-3  white-text text-darken-4 galeryStateButton"
   			node="button"
   			tooltip={props.tooltip}
   			waves="light"
   			floating
  			icon={<Icon>{props.icon}</Icon>}
  			onClick={props.onClick}
   		/>
}


function CaptionInput(props){

	// let [value, setValue] = useState(null);	

 //    useEffect(() => {
	// 	if(value===null){
	// 		setValue(props.initialValue);
	// 	}
	// });
	

	return <div className="input-field row">
      		{/* <input defaultValue={props.initialValue} value={value} id={props.inputId} type="text" onChange={(e)=> setValue(e.target.value)}/> */}
      		<input defaultValue={props.initialValue} id={props.inputId} type="text" />
      		<label className={props.initialValue?"active":""} htmlFor={props.inputId}>Image Caption</label>
    	</div>
}


function RenderGallery(props){

	let query = null;//db.collection("images").where("workshopId", "==", props.user.currentWorkshop);

	if(props.showUserGallery === true){
		query = db.collection("images").where("workshopId", "==", props.user.currentWorkshop).where("uid", "==", props.user.id);
	}else{
		query = db.collection("images").where("workshopId", "==", props.user.currentWorkshop);
	}
	

	const [images, imagesLoading] = useCollectionData(query); 
	
	let [state, setState] = useState(state_idle);
	let [editImg, setEditImg] = useState(null);

	function setImgToEdit(img){
		if(img === null){
			closeModal("ModalEditCaption");
			setEditImg(null);
			setState(state_idle);
		}else{
			setEditImg(img);
			openModal("ModalEditCaption");
		}
	}

	function deleteCallback(img){
		deleteImg(img);
		
		setState(state_idle);
	}
	
	
	let idPrefix ="";
	let title= "Master Gallery";
	var captionInputId = "TextInputEditCaptionModal";
	if(props.showUserGallery === true){
		idPrefix="user";
		title = "Your Gallery";
		captionInputId = idPrefix+captionInputId;
	}


	return <>
		<div id={ idPrefix+"gallery"} className="subGallery"> 
			<div className="subGalleryHeader">
				<h5>{title}</h5>
				{((props.showUserGallery === true || props.user.type !== userTypes().student) )? 
					
					state === state_idle? <div>
						<SetStateButton
							tooltip="Delete images"
							icon="delete"
							onClick={()=> setState(state_deleting)}
						/>
						<SetStateButton
							tooltip="Edit captions"
							icon="edit"
							onClick={()=> setState(state_editing)}
						/>
					</div>:
    					<SetStateButton
							tooltip="Cancel"
							icon="cancel"
							onClick={()=> setState(state_idle)}
						/>
    					
    				:""
    			}
			</div>
			<div id= {idPrefix+"GalleryImgs"} className="galleryImgs">
				{ imagesLoading && <CenteredPreloader  title={"Loading gallery"}/> }
				{(!imagesLoading && images && images.length >0) ?
				<ul>
				{images.map(img => <ShowImg
					key={img.id} 
					img={img} 
					state={state}
					setImgToEdit={setImgToEdit}
				 	deleteCallback={deleteCallback}
				 	user={props.user}
				 	showUserGallery={props.showUserGallery}

				 	/>)}
				<li></li>
				</ul>
				:
				<p> Empty gallery! </p>}
			</div>
		</div>
		<Modal
            actions={[      
                <Button 
                    node="button" 
                    waves="light" 
                    onClick={()=>{
                        db.collection("images").doc(editImg.id).update({caption: document.getElementById(captionInputId).value})
                        setImgToEdit(null);
                    }}
                >
                Apply
                </Button>,
                <Button flat node="button" waves="red"
                	onClick={()=>setImgToEdit(null)}
                	>Cancel</Button>
            ]}
            className="black-text"
            header="Edit caption"
            id="ModalEditCaption"
            root={document.getElementById('modalRoot')}
        >
        <>
            <CaptionInput
            	initialValue={editImg !== null ? editImg.caption: ""}
				inputId={captionInputId}
            />
        </>
    </Modal>
	</>
}
