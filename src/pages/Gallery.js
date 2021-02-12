
import React,  { useEffect, useState, useRef} from "react";

import { CenteredPreloader } from '../components/CenteredPreloader'

import { useCollectionData } from 'react-firebase-hooks/firestore';

import { auth, storageRef, db } from "../services/firebase";

import '../css/gallery.css';

import { Icon, Button, MediaBox } from 'react-materialize';

import { Link } from 'react-router-dom';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { userTypes } from "../helpers/Types"



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
	
  	return (<>
    	<div id={props.img.id} className="gridImg">
			<MediaBox
  				options={{
  				  	inDuration: 200,
  				  	outDuration: 200
  				}}
  				caption={props.img.caption}
				>
			  	<img
			    	alt=""
			    	src={props.img.downloadURL}
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
  					onClick={()=>props.deleteCallback(props.img, props.index)}
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
			 					key={props.images[i].id}
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

function RenderGallery(props){

	let query = db.collection("images").where("workshopId", "==", props.user.currentWorkshop);

	if(props.showUserGallery === true){
		query.where("uid", "==", props.user.id);
	}
	

	const [images, imagesLoading] = useCollectionData(query); 
	
	let [deleting, setDeleting] = useState(false);
	let [indices, setIndices] = useState([]);
	// let nextPageToken = useRef(null);
	// let currentPageToken = useRef(null);
	// let originalBg  = useRef(null);
	let [pctWidth, setPctWidth] = useState(20);
	let needsCalculateSize = useRef(true);
	

	if(needsCalculateSize.current === true && images && !imagesLoading){
		calculateSize();
	}



	function calculateSize(){
		let imgWidth = 200;
		let galleryPadding=60;
		let numColumns = Math.floor((getWidth()-galleryPadding)/imgWidth);
		let imgsPerCol =2;
		let modulo = 0;
		if(images && images.length > 0){
			imgsPerCol = Math.floor(images.length/numColumns);
			modulo = images.length % numColumns;
		}

		let newIndices = [];

		let startAt = 0;
		for(let x = 0; x < numColumns; x++){
			
			let num = imgsPerCol + ((x < modulo)? 1 : 0);
			let index = [];
			for(let i = startAt; i < startAt + num; i++){
				index.push(i);
			}
			newIndices.push(index);

			startAt += num;
		}

		setIndices(newIndices)
		setPctWidth(100.0 / numColumns);

		needsCalculateSize.current = false;
		// console.log("calculateSize. imgs: ", imagesRefs, "  indices: ", indices);

	}



	useEffect(()=>{
		window.addEventListener("resize", calculateSize);
		return (()=>{
			window.removeEventListener("resize", calculateSize);
		})

	});

	function deleteCallback(img, index){
		needsCalculateSize.current = true;
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
				{(!imagesLoading && images && images.length >0 && indices.length > 0) ?

				indices.map(index => <ShowColumn  
					pctWidth={pctWidth} 
					key={index} 
					index={index} 
					images={images} 
					deleting={deleting}
				 	deleteCallback={deleteCallback}
				 	user={props.user}
				 	/>)
				:
				<p> Empty gallery! </p>}
			</div>

		</div>
	</>
}