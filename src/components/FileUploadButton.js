import React, { useRef, useEffect } from "react";

import firebase from "firebase";

import { TextInput } from 'react-materialize';





export function FileUploadButton(props){

    const tooltipRef = useRef(null);
    const divRef= useRef(null);
    useEffect(() => {
        // console.log("UploadImgButton constructor");
        if(!tooltipRef.current && divRef.current){
            let btnEl = divRef.current.querySelector('.input-field .btn');
            if(btnEl){
                btnEl.classList.add('btn-floating');
                btnEl.dataset.tooltip = props.tootip;
                btnEl.dataset.position = props.tooltipPosition;
                tooltipRef.current = window.M.Tooltip.init(btnEl, null);
            }
        }
        return ()=>{
            // console.log("UploadImgButton destructor");
            if(tooltipRef.current){tooltipRef.current.destroy(); tooltipRef.current = null; }
        }
    });

    return(<>
        <div ref={divRef} id={props.id}>
            <TextInput
                label=<i className="material-icons">file_upload</i>
                type="file"                
                onChange={(evt)=>{
                    evt.stopPropagation();
                    evt.preventDefault();
                    if (evt.target.files && evt.target.files.length) {
                      props.callback(evt.target.files[0]);
                    }
                }}
            />
        </div>
    </>);
}