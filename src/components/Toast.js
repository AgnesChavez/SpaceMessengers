import React, { Component } from 'react';

export function Toast(props) {
 	return (

		<div className="toast d-flex align-items-center text-white bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true" id="myToast" data-autohide="false" style="position: absolute; top: 0; right: 0;">
  			<div className="toast-body">
    			{props.message}
  			</div>
  			<button type="button" className="btn-close btn-close-white ms-auto me-2" data-bs-dismiss="toast" aria-label="Close"></button>
		</div>
  	);
}


