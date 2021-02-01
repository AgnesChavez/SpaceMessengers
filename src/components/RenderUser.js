import React from "react";

export function RenderSidebarUser(props){
    return <button  onClick={()=>props.setOtherUserId(props.usr.id)}>
    		<img className="circle"  alt={props.usr.displayName} src={props.usr.photoURL || ("https://i.pravatar.cc/24?u=" + props.usr.id)}/>
    <span className='name' style={('color' in props.usr)?{color: props.usr.color}:{}}>
        {props.usr.displayName}
    </span>
</button>
}