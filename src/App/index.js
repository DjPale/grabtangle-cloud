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
import Badge from 'react-bootstrap/Badge';

import { MdLineStyle, MdAlarmAdd, MdAlarm, MdSkipNext, MdCheck, MdAddCircleOutline } from 'react-icons/md';

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
    
        this.state = { authUser: props.firebase.emptyUser, tasks: [], dirtylist: {} };
    }

    onTaskListUpdate = (list) => {
        this.setState({ tasks: list });
    }

    // Listen to the Firebase Auth state and set the local state.
    componentDidMount() {
        this.unregisterAuthObserver = this.props.firebase.auth.onAuthStateChanged(
            (user) => this.setState({ authUser: user })
        );

        this.props.firebase.registerTaskListUpdate(this.onTaskListUpdate);       
    }
    
    // Make sure we un-register Firebase observers when the component unmounts.
    componentWillUnmount() {
        this.unregisterAuthObserver();
    }

    onInputChange = (event, index) => {

        var name = null;
        const value = event.target.value;
        const pos = event.target.name.indexOf('-');
        if (pos != -1) {
            name = event.target.name.substr(0, pos);
        }

        if (!name) return;


        // https://www.robinwieruch.de/react-state-array-add-update-remove/
        // terrified of performance hit though....
        this.setState(state => {
            const tasks = state.tasks.map((item, i) => {
                if (i == index) {
                    item[name] = value;
                }

                return item;
            });

            return tasks;
        });
    }

    onBlur = (event) => {
        console.log(event);
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
        <Container>
            <Navbar bg="light" sticky="top">
            <div className="w-100 clearfix">
                <Navbar.Brand><MdLineStyle className="mb-1 mr-2" size={32} />Grabtangle</Navbar.Brand>
                <Navbar.Text className="float-right">
                    Hi, <a onClick={(e) => this.props.firebase.signOut() }>{this.state.authUser.displayName}</a>
                </Navbar.Text>                
                <ButtonToolBar className="mt-1 d-flex flex-column">
                    <ToggleButtonGroup type="radio" name="filter">
                        <ToggleButton value="today" variant="success" className="w-100">Today</ToggleButton>
                        <ToggleButton value="week" variant="primary" className="w-100">Week</ToggleButton>
                        <ToggleButton value="all" variant="info" className="w-100">All</ToggleButton>
                        <Button variant="secondary" className="w-100"><MdAddCircleOutline size={24}/></Button>
                    </ToggleButtonGroup>
                </ButtonToolBar>
            </div>
            </Navbar>

               <Accordion className="m-2">
                { this.state.tasks.map((task,index) => (
                    <Card key={task.id}>
                        <Accordion.Toggle as={Card.Header} eventKey={task.id}>
                        <Card.Title>{task.topic} <Badge className="float-right" variant="primary">{task.due.getDate() + "." + task.due.getMonth() + "." + task.due.getFullYear()}</Badge></Card.Title>
                        <Card.Subtitle className="text-truncate">{task.action}</Card.Subtitle> 
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={task.id}>
                            <Card.Body className="clearfix">
                                <Form onBlur={(e) => this.onBlur(e)}>
                                    <Form.Group controlId="control0">
                                        <Form.Control name={"topic-" + index} className="mb-1" type="text" value={task.topic} onChange={(e) => this.onInputChange(e, index)} />
                                        <Form.Control name={"action-" + index} as="textarea" rows="3" value={task.action} onChange={(e) => this.onInputChange(e, index)} />
                                    </Form.Group>
                                </Form>
                                <div className="float-right">
                                    <Button className="mr-2"><MdSkipNext size={28} /></Button>
                                    <Button className="mr-2" variant="warning"><MdAlarm size={28} /></Button>
                                    <Button variant="success"><MdCheck size={28} /></Button>
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                )) }
            </Accordion>
        </Container> 
        );
      };
}

export default App;