import React from 'react';
import '../css/dashboard.css';


function SidebarItem(props)
{

	return (<>
		<li className="nav-item">
            <a className={"nav-link "+ (props.active?"active":"text-light")} aria-current={props.current?"page":""} href={props.href}>
            	<span data-feather={props.icon}></span>
            	{props.content}
            </a>
        </li>
	</>);

}


function Sidebar(props){
	return (<>
	 <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse ">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
 			<SidebarItem active={true} current="page" href="#" icon="home" content="Dashboard"></SidebarItem>
 			<SidebarItem href="#" icon="file" content="Orders"></SidebarItem>
			<SidebarItem href="#" icon="shopping-cart" content="Products"></SidebarItem>
          	<SidebarItem href="#" icon="users" content="Customers" ></SidebarItem>
          	<SidebarItem href="#" icon="bar-chart-2" content="Reports" ></SidebarItem>
			<SidebarItem href="#" icon="bar-chart-2" content="Reports" ></SidebarItem>
          	<SidebarItem href="#" icon="layers" content="Integrations" ></SidebarItem>
        </ul>

        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Saved reports</span>
          <a className="link-secondary" href="#" aria-label="Add a new report">
          	<i class="bi bi-arrow-up-left-square-fill"></i>

            <span data-feather="plus-circle"></span>
          </a>
        </h6>
        <ul className="nav flex-column mb-2">
          <li className="nav-item">
            <a className="nav-link" href="#">
              <span data-feather="file-text"></span>
              Current month
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">
              <span data-feather="file-text"></span>
              Last quarter
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">
              <span data-feather="file-text"></span>
              Social engagement
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">
              <span data-feather="file-text"></span>
              Year-end sale
            </a>
          </li>
        </ul>
      </div>
    </nav>
	</>)
}	

export default function Settings(props){

return (<>
	<div className="container-fluid">
  		<div className="row">
  			<Sidebar></Sidebar>
  		</div>
  	</div>
  	</>)
}