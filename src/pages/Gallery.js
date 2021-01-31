
import React,  { useEffect, useState, useRef} from "react";

import { CenteredPreloader } from '../components/CenteredPreloader'

import { useDownloadURL } from 'react-firebase-hooks/storage';

import { auth, storageRef } from "../services/firebase";

import '../css/gallery.css';

import { Icon, Button, MediaBox } from 'react-materialize';

import { Link } from 'react-router-dom';

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



export default  function Gallery(props) {
    
	let listRef = storageRef.child('images/' + auth().currentUser.uid);
	
	let [imagesRefs, setImagesRefs] = useState(null);
	let [refsLoaded, setRefsLoaded] = useState(false);
	
	// let originalBg  = useRef(null);
	

	useEffect(()=>{
		if(!refsLoaded){
			listRef.listAll().then(res=>{
				setRefsLoaded(true);
				setImagesRefs(res.items);
			}).catch((error)=> {
  				console.log("Loading gallery failed with error:", error);
			});
			// if(originalBg.current === null){
			// 	originalBg.current = document.querySelector('body').style.backgroundImage;
			// 	document.querySelector('body').style.backgroundColor = "black";
			// 	document.querySelector('body').style.backgroundImage = "unset";	
			// }
			
		}
		// return (()=>{
			// if(originalBg.current){
			// 	document.querySelector('body').style.backgroundColor = "unset";
			// 	document.querySelector('body').style.backgroundImage = originalBg.current;		
			// }
		// })
	});


	return <>
		<div id="galleryContainer"> 
			    <header>
      <h4>Space Messengers Gallery</h4>
    </header>
		<div id="gallery"> 

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


		<div id="GalleryImgs">
			{(imagesRefs!==null && imagesRefs.length >0) ?
				imagesRefs.map(i => <LoadAndShowImage 
			 							key={i.fullPath}
			 							img={i}/>)
				:
				<h4> Your image gallery is empty! </h4>
			}
			</div>
		</div>
	</div>
	</>
}