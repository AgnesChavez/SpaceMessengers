
import React,  { useEffect, useState, useRef} from "react";

import { CenteredPreloader } from '../components/CenteredPreloader'

import { useDownloadURL } from 'react-firebase-hooks/storage';

import { auth, storageRef } from "../services/firebase";

import '../css/gallery.css';

import { Icon, Button, MediaBox } from 'react-materialize';

import { Link } from 'react-router-dom';


function getWidth() {
  	return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
	);
}




function LoadAndShowImage(props){
	
	const [value, loading] = useDownloadURL(props.img);

  	
  	return (<>
    	<div id={props.img.name} className="gridImg">
      		{loading && <CenteredPreloader title={"Loading images"}/>}
      		{!loading && value && 

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
			</MediaBox>}			
    	</div>
    </>);
}

function ShowColumn(props){
	return <div className="GalleryColumn" style={{flex: props.pctWidth+"%", maxWidth: props.pctWidth+"%" }}>
  
		{props.index &&
		 props.index.map(i => <LoadAndShowImage
			 					key={props.imagesRefs[i].fullPath}
			 					img={props.imagesRefs[i]}/>)}

	</div>
}

export default  function Gallery(props) {
    
	let listRef = storageRef.child('images');// + auth().currentUser.uid);
	
	let [imagesRefs, setImagesRefs] = useState(null);
	let [refsLoaded, setRefsLoaded] = useState(false);
	let [indices, setIndices] = useState([]);

	// let originalBg  = useRef(null);
	let [pctWidth, setPctWidth] = useState(20);
	

	async function getImages(){
		try{
			let all = await listRef.listAll();

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

				setRefsLoaded(true);
				setImagesRefs(allItems);
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

	
	
	
	

	return <>
		
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
		<div id="gallery"> 
			<div id="GalleryImgs">
				{(imagesRefs!==null && imagesRefs.length >0 && indices.length > 0) ?

				indices.map(index => <ShowColumn  pctWidth={pctWidth} key={index} index={index} imagesRefs={imagesRefs}/>)

				:
				<h4> Your image gallery is empty! </h4>
			}
			</div>
	</div>
	</>
}