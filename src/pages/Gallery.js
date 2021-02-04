
import React,  { useEffect, useState, useRef} from "react";

import { CenteredPreloader } from '../components/CenteredPreloader'

import { useDownloadURL } from 'react-firebase-hooks/storage';

import { auth, storageRef, db } from "../services/firebase";

import '../css/gallery.css';

import { Icon, Button, MediaBox } from 'react-materialize';

import { Link } from 'react-router-dom';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { userTypes } from "../helpers/Types"

import { UploadImgButton } from '../helpers/imgStorage'

function getWidth() {
  	return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
	);
}

function deleteImg(imgRef){
	storageRef.child(imgRef.fullPath).delete().then(() => {
  
	}).catch((error) => {
  		console.log("error deleting file", error);
	});
}


function LoadAndShowImage(props){
	
	const [value, loading] = useDownloadURL(props.img);
  	
  	return (<>
    	<div id={props.img.name} className="gridImg">
      		{loading && <CenteredPreloader title={"Loading images"}/>}
      		{!loading && value && 

				<>
			<MediaBox
  				options={{
  				  	inDuration: 200,
  				  	outDuration: 200
  				}}
				>
			  	<img
			    	alt=""
			    	src={value}
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
    			</>
			}			
    	</div>
    </>);
}

function ShowColumn(props){
console.log("Col refs:", props.imagesRefs);
console.log("Col index:", props.index);
	return <div className="GalleryColumn" style={{flex: props.pctWidth+"%", maxWidth: props.pctWidth+"%" }}>
  
		{props.index && 
		 props.index.map(i => (i < props.imagesRefs.length)? <LoadAndShowImage
			 					key={props.imagesRefs[i].fullPath}
			 					img={props.imagesRefs[i]}
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
	let galleryPath = 'images';
	if(props.showUserGallery === true){
		galleryPath += '/'+ auth().currentUser.uid;	
	}
	

	let listRef = storageRef.child(galleryPath);
	
	let [imagesRefs, setImagesRefs] = useState(null);
	let [refsLoaded, setRefsLoaded] = useState(false);
	let [deleting, setDeleting] = useState(false);
	let [indices, setIndices] = useState([]);

	// let originalBg  = useRef(null);
	let [pctWidth, setPctWidth] = useState(20);
	

	async function getImages(){
		try{
			let all = await listRef.listAll();

			if(props.showUserGallery === true){
				setImagesRefs(all.items);
			}else{
				let allItems = [];
				for(let i = 0; i < all.prefixes.length; i++){
					let folder = await all.prefixes[i].listAll();
					if(folder.items.length > 0 ){
						// console.log(folder.items);
						allItems = allItems.concat(folder.items);
						// console.log(allItems);
      					// allItems.push(...folder.items);
					}
		    	}
		    	setImagesRefs(allItems);
			}
			setRefsLoaded(true);
			calculateSize();
				
		}catch(error) {
  			console.log("Loading gallery failed with error:", error);
		}
	}

	function calculateSize(){
		let imgWidth = 200;
		let galleryPadding=60;
		let numColumns = Math.floor((getWidth()-galleryPadding)/imgWidth);
		let imgsPerCol =2;
		let modulo = 0;
		if(refsLoaded && imagesRefs && imagesRefs.length > 0){
			imgsPerCol = Math.floor(imagesRefs.length/numColumns);
			modulo = imagesRefs.length % numColumns;
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
			// indices
			// numImgsPerCol.push({num, startAt});
			startAt += num;
		}

	// console.log("indices", indices);
		setIndices(newIndices)
		setPctWidth(100.0 / numColumns);


		console.log("calculateSize. imgs: ", imagesRefs, "  indices: ", indices);

	}

	useEffect(()=>{
		window.addEventListener("resize", calculateSize);

		if(!refsLoaded){
			getImages();
			// if(originalBg.current === null){
			// 	originalBg.current = document.querySelector('body').style.backgroundImage;
			// 	document.querySelector('body').style.backgroundColor = "black";
			// 	document.querySelector('body').style.backgroundImage = "unset";	
			// }
			
		}
		return (()=>{
			window.removeEventListener("resize", calculateSize);
		})

	});

	function deleteCallback(img, index){
		deleteImg(img);	

		let tempImgs = imagesRefs;
		tempImgs.splice(index, 1);
		setImagesRefs(tempImgs);

		// let tempIndices = indices;
		// tempIndices.splice(index, 1);
		// setIndices(tempIndices);
		calculateSize();
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
				{(imagesRefs!==null && imagesRefs.length >0 && indices.length > 0) ?

				indices.map(index => <ShowColumn  
					pctWidth={pctWidth} 
					key={index} 
					index={index} 
					imagesRefs={imagesRefs} 
					deleting={deleting}
				 	deleteCallback={deleteCallback}
				 	/>)
				:
				<p> Empty gallery! </p>}
			</div>
		</div>
	</>
}