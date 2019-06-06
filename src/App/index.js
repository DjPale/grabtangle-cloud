import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import JumboTron from 'react-bootstrap/Jumbotron';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ButtonToolBar from 'react-bootstrap/ButtonToolbar';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import { MdLineStyle, MdAlarmAdd, MdAlarm, MdEdit, MdSkipNext, MdCheck } from 'react-icons/md';

class App extends React.Component {
    uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.GithubAuthProvider.PROVIDER_ID,
            firebase.auth.TwitterAuthProvider.PROVIDER_ID
        ],
        callbacks: {
          // Avoid redirects after sign-in.
          signInSuccessWithAuthResult: () => false,
          uiShown: function() {
              document.getElementById('LoginLoader').style.display = 'none';
            }
        }
    }

    constructor(props) {
        super(props);
    
        this.state = { authUser: props.firebase.emptyUser, list: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] };
    }

    // Listen to the Firebase Auth state and set the local state.
    componentDidMount() {
        this.unregisterAuthObserver = this.props.firebase.auth.onAuthStateChanged(
            (user) => this.setState({ authUser: user })
        );
    }
    
    // Make sure we un-register Firebase observers when the component unmounts.
    componentWillUnmount() {
        this.unregisterAuthObserver();
    }

    render() {
        if (!this.state.authUser) {
            return (
            <JumboTron>
                <h1 className="text-center mb-5">Welcome to Grabtangle!</h1>
                <p id="LoginLoader" className="text-center">Loading...</p>
                <StyledFirebaseAuth uiConfig={ this.uiConfig } firebaseAuth={ this.props.firebase.auth } />
            </JumboTron>
            );
        }
        return (
        <div>
            <Navbar bg="light" sticky="top">
            <div className="w-100 clearfix">
                <Navbar.Brand><MdLineStyle className="mb-1 mr-2" size={32} />Grabtangle</Navbar.Brand>
                <Navbar.Text className="float-right">
                    Hi, <abbr onClick={(e) => this.props.firebase.auth.signOut() }>{this.state.authUser.displayName}</abbr>
                </Navbar.Text>                
                <ButtonToolBar className="mt-1 d-flex flex-column">
                    <ToggleButtonGroup type="radio" name="filter">
                        <ToggleButton value="today" variant="success" className="w-100">Today</ToggleButton>
                        <ToggleButton value="week" variant="primary" className="w-100">Week</ToggleButton>
                        <ToggleButton value="all" variant="info" className="w-100">All</ToggleButton>
                    </ToggleButtonGroup>
                </ButtonToolBar>
            </div>
            </Navbar>

               <Accordion defaultActiveKey="0" className="m-2">
                    <Card key="0">
                        <Accordion.Toggle as={Card.Header} eventKey="0">
                        Click me - "0"
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body className="clearfix">
                                <Form>
                                <Form.Group controlId="control0">
                                    <Form.Control type="text"  />
                                    <Form.Control type="text"  />
                                </Form.Group>
                                </Form>
                                <div className="float-right">
                                    <Button className="mr-2"><MdSkipNext size={28} /></Button>
                                    <Button className="mr-2" variant="warning"><MdAlarm size={28} /></Button>
                                    <Button  variant="success"><MdCheck size={28} /></Button>
                                    </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                { this.state.list.map((num) => (
                    <Card key={num}>
                        <Accordion.Toggle as={Card.Header} eventKey={num}>
                        Click me - {num}
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={num}>
                            <Card.Body className="clearfix">
                                <Form>
                                <Form.Group controlId={"control" + num}>
                                    <Form.Control type="text" className="w-25" />
                                    <Form.Control type="text" className="w-75" />
                                </Form.Group>
                                </Form>
                                <div className="float-right">
                                    <Button className="mr-2"><MdAlarmAdd size="lg"/></Button>
                                    <Button className="mr-2">b2</Button>
                                    <Button className="mr-2">b3</Button>
                                    </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                )
                )}
            </Accordion>
        </div> 
           

        );

      };
}

export default App;