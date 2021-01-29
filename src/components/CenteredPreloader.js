import { Row, Col, Preloader} from 'react-materialize';


export function CenteredPreloader(props){
	return (<>
          <Row>
              <h6 className="center-align">{props.tilte}</h6>
          </Row>
          <Row style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
          <Col s={2} offset="s5" style={{width: "unset", margin: "auto"}}>
              <Preloader 
                  active
                  color="blue"
                  flashing
              />
          </Col>
          </Row>
      </>);
}
