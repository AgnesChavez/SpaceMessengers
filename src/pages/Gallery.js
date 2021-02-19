
import React,  { useState } from "react";

import { CenteredPreloader } from '../components/CenteredPreloader'

import { useCollectionData } from 'react-firebase-hooks/firestore';

import { auth, storageRef, db } from "../services/firebase";

import '../css/gallery.css';

import { Icon, Button } from 'react-materialize';

import { Link } from 'react-router-dom';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { userTypes } from "../helpers/Types"


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
    	var box = window.M.Materialbox.init(elem, 
    		{onCloseStart: ()=> { if(thumbSrc) elem.src = thumbSrc },
    		 onCloseEnd: ()=> { let instance = window.M.Materialbox.getInstance(elem);
    		 	if(instance) instance.destroy();
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
				
			{ props.deleting === true && 
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
		</li>
	</>)    	
}

function RenderGallery(props){

	let query = null;//db.collection("images").where("workshopId", "==", props.user.currentWorkshop);

	if(props.showUserGallery === true){
		query = db.collection("images").where("workshopId", "==", props.user.currentWorkshop).where("uid", "==", props.user.id);
	}else{
		query = db.collection("images").where("workshopId", "==", props.user.currentWorkshop);
	}
	

	const [images, imagesLoading] = useCollectionData(query); 
	
	let [deleting, setDeleting] = useState(false);
	

	function deleteCallback(img){
		deleteImg(img);
		
		setDeleting(false);
	}
	
	
	let idPrefix ="";
	let title= "Master Gallery";
	if(props.showUserGallery === true){
		idPrefix="user";
		title = "Your Gallery";
	}

	return <>
		<div id={ idPrefix+"gallery"} className="subGallery"> 
			<div className="subGalleryHeader">
				<h5>{title}</h5>
				{((props.showUserGallery === true || props.user.type !== userTypes().student) )? 
				
					<Button
    					className="grey darken-3  white-text text-darken-4 "
    					node="button"
    					tooltip={(deleting === false)?"Delete images":"Cancel"}
    					waves="light"
    					floating
  						icon={<Icon>{(deleting === false)?"delete":"cancel"}</Icon>}
  						onClick={()=>setDeleting(!deleting)}
    				/>:""
    			}
			</div>
			<div id= {idPrefix+"GalleryImgs"} className="galleryImgs">
				{ imagesLoading && <CenteredPreloader  title={"Loading gallery"}/> }
				{(!imagesLoading && images && images.length >0) ?
				<ul>
				{images.map(img => <ShowImg
					key={img.id} 
					img={img} 
					deleting={deleting}
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
	</>
}
