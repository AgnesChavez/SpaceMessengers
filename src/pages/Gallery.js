
import React,  { useEffect, useState} from "react";
import CenteredPreloader from '../components/CenteredPreloader'
import { useDownloadURL } from 'react-firebase-hooks/storage';
import firebase from "firebase";

import { auth, storageRef } from "../services/firebase";

import '../css/gallery.css';

function LoadAndShowImage(props){
	// let ref = firebase.storage().ref('images/' + auth().currentUser.uid + "/cvWHAAzbDEMUdkXS2d8s.png");
	// console.log(props.img);
  const [value, loading, error] = useDownloadURL(props.img);
  	
  
  return (<>
    <div className="gridImg">

      {loading && <CenteredPreloader title={"Loading images"}/>}
      {!loading && value && <img src={value} alt=""/> }
    </div>
    </>
  );
};



export default  function Gallery(props) {
    

let listRef = storageRef.child('images/' + auth().currentUser.uid);
	
	let [imagesRefs, setImagesRefs] = useState(null);
	let [refsLoaded, setRefsLoaded] = useState(false);
useEffect(()=>{
	if(!refsLoaded){
	listRef.listAll().then(res=>{
		
			setRefsLoaded(true);
			setImagesRefs(res.items);
		 	// console.log(res.items);
		
	}).catch((error)=> {
  		console.log(error);
	});
	}
});

	
	



return <>
	<div id="gallery"> 
		{(imagesRefs!==null && imagesRefs.length >0) ? imagesRefs.map(i => <LoadAndShowImage key={i.fullPath} img={i}/>):
		<h4> Your image gallery is empty! </h4>}
	</div>
	</>
}