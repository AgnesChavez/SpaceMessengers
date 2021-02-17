
import React,  { useEffect, useState, useRef} from "react";

import { CenteredPreloader } from '../components/CenteredPreloader'

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useDownloadURL } from 'react-firebase-hooks/storage';

import { auth, storageRef, db } from "../services/firebase";

import '../css/gallery.css';

import { Icon, Button, MediaBox } from 'react-materialize';

import { Link } from 'react-router-dom';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { userTypes, ImageData } from "../helpers/Types"

import { addDataToDb } from '../helpers/db';

function getWidth() {
  	return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
	);
}

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




function LoadAndShowImage(props){
	// const [downloadUrl, loading] = useDownloadURL(storageRef.child(props.img.imagePath));	
  	return (<>
    	<div id={props.img.id} className="gridImg">
    		{/* { loading && <CenteredPreloader  title={"Loading image"}/> } */}
    		{/* {downloadUrl && !loading && */}
			<MediaBox
  				options={{
  				  	inDuration: 200,
  				  	outDuration: 200
  				}}
  				caption={props.img.caption}
				>
			  	<img
			    	alt={props.img.caption}
			    	src={props.img.thumbURL}
			    	className=" materialboxed galleryImg"
			  	/>
			</MediaBox>
			  	{props.deleting === true && 
			  		<Button
    				className="red right"
    				node="button"
    				small
    				tooltip="Delete this image"
    				waves="light"
    				floating
  					icon={<Icon>delete</Icon>}
  					onClick={()=>props.deleteCallback(props.img)}
    			/>}
    	</div>
    </>);
}

function ShowColumn(props){
// console.log("Col refs:", props.imagesRefs);
// console.log("Col index:", props.index);
	return <div className="GalleryColumn" style={{flex: props.pctWidth+"%", maxWidth: props.pctWidth+"%" }}>
  
		{props.index && 
		 props.index.map(i => (i < props.images.length)? <LoadAndShowImage
			 					key={"img"+props.images[i].id}
			 					img={props.images[i]}
			 					deleting={props.deleting}
			 					deleteCallback={props.deleteCallback}
			 					index={i}
			 				/>:"")}

	</div>
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
	console.log("createMediaBox ", imgId);
	
	var elem = document.getElementById(imgId);
	if(elem){
		elem.src = src;
    	var box = window.M.Materialbox.init(elem, {onCloseStart: ()=> { if(thumbSrc) elem.src = thumbSrc }});
    	box.open();
	}else{
		console.log("createMediaBox failed: imageId " + imgId + " does not exist");
	}


}


//img
//deleting
//deleteCallback
//user
function ShowImg(props){
	// const [downloadUrl, loading, error] = useDownloadURL(storageRef.child(props.img.imagePath));

	// console.log(props.img.thumbURL);
	// if(!props.img.thumbURL)return "";
	

	// const [showImageBox, setShowImageBox] = useState(false);

// 
// 	if(!props.img.thumbURL && !props.img.downloadURL){
// 		console.log(props.img);
// 		return "";
// 	}


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
	// let [indices, setIndices] = useState([]);
	// let nextPageToken = useRef(null);
	// let currentPageToken = useRef(null);
	// let originalBg  = useRef(null);
	// let [pctWidth, setPctWidth] = useState(20);
	let needsCalculateSize = useRef(true);
	

	// if(needsCalculateSize.current === true && images && !imagesLoading){
	// 	calculateSize();
	// }



// 	function calculateSize(){
// 		let imgWidth = 200;
// 		let galleryPadding=60;
// 		let numColumns = Math.floor((getWidth()-galleryPadding)/imgWidth);
// 		let imgsPerCol =2;
// 		let modulo = 0;
// 		if(images && images.length > 0){
// 			imgsPerCol = Math.floor(images.length/numColumns);
// 			modulo = images.length % numColumns;
// 		}
// 
// 		let newIndices = [];
// 
// 		let startAt = 0;
// 		for(let x = 0; x < numColumns; x++){
// 			
// 			let num = imgsPerCol + ((x < modulo)? 1 : 0);
// 			let index = [];
// 			for(let i = startAt; i < startAt + num; i++){
// 				index.push(i);
// 			}
// 			newIndices.push(index);
// 
// 			startAt += num;
// 		}
// 
// 		// console.log("newIndices", newIndices);
// 		setIndices(newIndices)
// 
// 		setPctWidth(100.0 / numColumns);
// 
// 		needsCalculateSize.current = false;
// 		// console.log("calculateSize. imgs: ", imagesRefs, "  indices: ", indices);
// 
// 	}


// 
// 	useEffect(()=>{
// 		window.addEventListener("resize", calculateSize);
// 		return (()=>{
// 			window.removeEventListener("resize", calculateSize);
// 		})
// 
// 	});

	function deleteCallback(img){
		// needsCalculateSize.current = true;
		deleteImg(img);

		// let tempImgs = imagesRefs;
		// tempImgs.splice(index, 1);
		// setImagesRefs(tempImgs);
		// calculateSize();
		
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

// function GetOtherImages(props){
// 	async function getImgs(){
// 		try{
// 			
// 			let all = await storageRef.child("images").listAll();
// 				// let allItems = [];
// 				for(let i = 0; i < all.prefixes.length; i++){
// 					// console.log(all.prefixes[i].name);
// 					let uid = all.prefixes[i].name;
// 					let folder = await all.prefixes[i].listAll();
// 					if(folder.items.length > 0 ){
// 						// console.log(folder.items);
// 						for(let i = 0; i < folder.items.length; i++){
// 							let url = await folder.items[i].getDownloadURL();
// 							// console.log(url);
//                 			let newImage = ImageData(uid, "XIWfFl9mm0GxYZb7svG6", url, "", folder.items[i].fullPath);
//         					
//                 			addDataToDb("images" ,newImage, true, "id");
// 							// console.log(newImage);
// 						}
// 						// console.log(folder.items);
// 						// allItems = allItems.concat(folder.items);
// 						// console.log(allItems);
//     	 					// allItems.push(...folder.items);
// 					}
// 		    	}
// 		}catch(error) {
//   			console.log("Loading gallery failed with error:", error);
// 		}
// 	}
// 	return <Button
//     		className="red white-text"
//     		node="button"
//     		waves="light"
//   			onClick={()=>getImgs()}
// 		>
// 		Get All Images
// 		</Button>
// }