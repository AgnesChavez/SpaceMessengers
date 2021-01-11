import React, { useState, useRef } from "react";

// import { Button, TextInput } from 'react-materialize';

import '../css/renameable.css';
import '../css/board.css';
import { isFunction } from '../helpers/utils'

// function isFunction(functionToCheck) {
//  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
// }

export default function Renameable(props){

	const [ isEditing, setIsEditing ] = useState(false);
	
	const isButtonPressed = useRef(false);
	const textInputRef = useRef(null);

	const buttonRef = useRef(null);
	const renamebleRef = useRef(null);
	const textRef = useRef(null);


	function disableEdit(e){
		if(isEditing && !isButtonPressed.current){
			console.log("disableEdit");
			setIsEditing(false);
		}
	}
	
	function buttonPressed(e){
		console.log("buttonPressed");
		if(isEditing){
			if(isFunction(props.onRename)){
				props.onRename(textInputRef.current.value);
			}
		}else{
			//This is ugly. Wish there was a better solution
			setTimeout(function(){ 
				if(textInputRef.current)textInputRef.current.focus();
			}, 200);
		}
		isButtonPressed.current = false;
		setIsEditing(!isEditing);
	}

	function showButton(){if(!isEditing && buttonRef.current) buttonRef.current.style.visibility = ''}
	function hideButton(){if(!isEditing && buttonRef.current) buttonRef.current.style.visibility = 'hidden'}

	function onHover(target, isOver){
		target.style.color=isOver?props.hoverColor:"white";
		target.style.cursor=isOver?'pointer':'';
	}

		return (<>
			<div  ref={renamebleRef} className="Renambeable white-text"
					onMouseOver={showButton}
					onMouseOut={hideButton}
				>
				{/* <TextInput  */}
				
				<input id="textInput"
					type='text'
					defaultValue={props.text}
					ref={textInputRef}
					disabled={isEditing?false: true}
					onBlur={disableEdit}
					onFocus={()=> console.log("on focus")}
					style={{display: isEditing?"":"none"}}
				/>
				<button ref={textRef}
					style={{color: "white",
							display: isEditing?"none":""
					}}
					className="transparent textButton"
					onMouseOver={(e)=> onHover(e.target, true)}
					onMouseOut={(e)=> onHover(e.target, false)}
					onClick={(e)=>{isFunction(props.onTextClick) && props.onTextClick(e)}}
					>
					{props.text}
				</button>
				
                <button ref={buttonRef}
                    className="InlineTinyButton btn "
                    onClick={buttonPressed}
                    onMouseDown={()=>isButtonPressed.current = true}
                    style={{visibility: 'hidden'}}
                    >
                    <i className=" tiny material-icons">{isEditing?"done":"edit"}</i>
                </button>
            </div>
    	</>);
	// }

}