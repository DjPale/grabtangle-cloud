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
import Popover from 'react-bootstrap/Popover';
import Overlay from 'react-bootstrap/Overlay';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import { MdLineStyle, MdAlarmAdd, MdAlarm, MdSkipNext, MdCheck, MdAddCircleOutline } from 'react-icons/md';

import { DAY_ADD, alignDate, getDates, toDateString } from '../utils/dateutils';

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

    filterDefinitions = {
        today: (task, today) => { return (alignDate(task.due).valueOf() <= today) },
        week: (task, today) => { return (alignDate(task.due).valueOf() <= (today + (7 * DAY_ADD))) } ,
        all: () => { return true }
    }

    constructor(props) {
        super(props);
    
        this.state = { 
            authUser: props.firebase.emptyUser, 
            tasks: [],
            selectedFilter: 'today',
            filterCounters: {},
            filteredTasks: [],
            dates: [], 
            addDate: new Date(),
            addTopic: "",
            addAction: "",
            showPostpone: false, 
            targetPostpone: null 
        };
    }

    applyFilters = (list, value) => {
        let today = alignDate(new Date()).valueOf();

        let filterFunc = this.filterDefinitions[value];

        const filteredTasks = list.filter((item) => {
                return filterFunc(item, today);
        });

        
        this.setState({ filteredTasks: filteredTasks });
    }


    updateFilterCounters = (list) => {
        let today = alignDate(new Date()).valueOf();

        Object.keys(this.filterDefinitions).forEach((key) => {
            let filterCount = list.reduce((accumulator, task) => {
                accumulator += (this.filterDefinitions[key](task, today) ? 1 : 0);
                return accumulator;
            }, 0);

            this.state.filterCounters[key] = filterCount;
        });
    }

    onTaskListUpdate = (list) => {
        this.setState({ tasks: list });
        this.updateFilterCounters(list);
        this.applyFilters(list, this.state.selectedFilter);
    }

    // Listen to the Firebase Auth state and set the local state.
    componentDidMount() {
        this.unregisterAuthObserver = this.props.firebase.auth.onAuthStateChanged(
            (user) => this.setState({ authUser: user })
        );

        this.props.firebase.registerTaskListUpdate(this.onTaskListUpdate);       

        this.setState({dates: getDates()});
    }
    
    // Make sure we un-register Firebase observers when the component unmounts.
    componentWillUnmount() {
        this.unregisterAuthObserver();
    }

    onFilterButton = (value) => {
        this.setState({ selectedFilter: value });
        this.applyFilters(this.state.tasks, value);
    }

    onInputChange = (event, task) => {
        let name = null;
        const value = event.target.value;
        const pos = event.target.name.indexOf('-');
        if (pos !== -1) {
            name = event.target.name.substr(0, pos);
        }
        else {
            return;
        }
      
        // https://www.robinwieruch.de/react-state-array-add-update-remove/
        // terrified of performance hit though....
        this.setState(state => {
            const tasks = state.tasks.map((item) => {
                if (task.id === item.id) {
                    item[name] = value;
                }

                return item;
            });

            return tasks;
        });
    }

    onBlur = (event) => {
        this.props.firebase.updateTaskList(this.state.tasks);
    }

    onPostponeButtonClick = (event) => {
        this.setState({ showPostpone: !this.state.showPostpone, targetPostpone: event.currentTarget });
    }

    onPostpone = (event, date) => {
        let name = this.state.targetPostpone.name;
        const pos = name.indexOf('-');

        let key = null;

        if (pos !== -1) {
            key = name.substr(pos + 1);
        }
        else {
            return;
        }

        this.setState(state => {
            const tasks = state.tasks.map((item) => {
                if (key == item.id) {
                    item.due = date;
                }

                return item;
            });

            return tasks;
        });
    }

    onPostponeButtonBlur = (event) => {
        this.setState({ showPostpone: false });
    }

    onCompleteButtonClick = (event, task) => {
        this.props.firebase.completeTask(task.id);
    }

    onNextActionClick = (event, task) => {
        this.setState(state => {
            const tasks = state.tasks.map((item) => {
                if (task.id === item.id) {
                    item.action = '';
                    
                }

                return item;
            });

            return tasks;
        });
    }

    onNewButtonClick = (event) => {
        this.props.firebase.newTask(this.state.addTopic, this.state.addAction, this.state.addDate);

        this.setState({ addTopic: "", addAction: "" });
    }

    onNewDueButtonClick = (event,dateItem) => {
        this.setState({ addDate: dateItem.date });
    }

    onNewTopicChange = (event) => {
        this.setState({ addTopic: event.target.value });
    }

    onNewActionChange = (event) => {
        this.setState({ addAction: event.target.value });
    }

    // TODO: move?
    dateToVariant = (date) => {
        let today = alignDate(new Date()).valueOf();
        let due = alignDate(date).valueOf();
        let week = (today + 7 * DAY_ADD);

        if (due < today) {
            return "danger";
        }
        else if (due == today) {
            return "success";
        }
        else if (due <= week) {
            return "primary";
        }

        return "info";
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
            <div className="w-100">
                <Navbar.Brand><MdLineStyle className="mb-1 mr-2" size={32} />Grabtangle</Navbar.Brand>
                <Navbar.Text className="float-right">
                    Hi, <a onClick={(e) => this.props.firebase.signOut() }>{this.state.authUser.displayName}</a>
                </Navbar.Text>                
                <ButtonToolBar className="mt-1 d-flex flex-column">
                    <ToggleButtonGroup type="radio" name="filter" value={this.state.selectedFilter} onChange={(value) => this.onFilterButton(value)}>
                        <OverlayTrigger trigger="click" placement="bottom" overlay={
                            <Popover title='Add new task'>
                                <Form>
                                    <Form.Group>
                                        <Form.Label>Topic</Form.Label>
                                        <Form.Control type="input" onChange={(e) => this.onNewTopicChange(e)} value={this.state.addTopic}></Form.Control>
                                        <Form.Label className="mt-1">Next action</Form.Label>
                                        <Form.Control as="textarea" onChange={(e) => this.onNewActionChange(e)} value={this.state.addAction}></Form.Control>
                                        <Button className="mt-2 mb-1" variant="success" 
                                            onClick={(e) => this.onNewButtonClick(e)} 
                                            disabled={this.state.addTopic.length == 0 || this.state.addAction.length == 0}>Add</Button>
                                        <Badge variant="primary" className="float-right mt-3">{toDateString(this.state.addDate)}</Badge>
                                        <ButtonToolBar className="d-flex flex-row">
                                            { this.state.dates.map((dt) => (
                                                <Button key={dt.name} className="w-50 rounded-pill mt-1" size="sm" variant="primary"
                                                    onClick={(e) => this.onNewDueButtonClick(e,dt)}>{dt.name}</Button>
                                            ))
                                            }
                                        </ButtonToolBar>
                                    </Form.Group>
                                </Form>
                            </Popover>
                        }>
                            <Button variant="secondary" className="w-100"><MdAddCircleOutline size={24}/></Button>
                        </OverlayTrigger>
                        <ToggleButton value="today" variant="success" className="w-100">
                            Today <Badge variant="secondary" pill className="w-auto float-right">{this.state.filterCounters['week']}</Badge>
                        </ToggleButton>
                        <ToggleButton value="week" variant="primary" className="w-100">
                            Week <Badge variant="secondary" pill className="float-right">{this.state.filterCounters['week']}</Badge>
                        </ToggleButton>
                        <ToggleButton value="all" variant="info" className="w-100">
                            All <Badge variant="secondary" pill className="float-right">{this.state.filterCounters['all']}</Badge>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </ButtonToolBar>
            </div>
            </Navbar>

            <Overlay show={this.state.showPostpone} target={this.state.targetPostpone} placement="top" container={this} containerPadding={20}>                    
                <Popover id="postpone-popover" title="Postpone">
                    <ButtonToolBar className="d-flex flex-column">
                        {this.state.dates.map((dt) => 
                            <Button key={dt.name} className="mr-1 mb-1" variant="warning" 
                                onClick={(e) => this.onPostpone(e,dt.date)}>{dt.name}</Button>
                        )} 
                    </ButtonToolBar>
                </Popover>
            </Overlay>

                
            <Accordion className="m-2">
                { this.state.filteredTasks.map((task) => (
                    <Card key={task.id}>
                        <Accordion.Toggle as={Card.Header} eventKey={task.id} onClick={(e) => this.onBlur(e)}>
                        <Card.Title>{task.topic} <Badge className="float-right" variant={this.dateToVariant(task.due)}>{toDateString(task.due)}</Badge></Card.Title>
                        <Card.Subtitle className="text-truncate">{task.action}</Card.Subtitle> 
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={task.id}>
                            <Card.Body className="clearfix">
                                <Form onBlur={(e) => this.onBlur(e)}>
                                    <Form.Group controlId="control0">
                                        <Form.Control name={"topic-" + task.id} className="mb-1" type="text" value={task.topic} 
                                            onChange={(e) => this.onInputChange(e, task)} />
                                        <Form.Control name={"action-" + task.id} as="textarea" rows="3" value={task.action} 
                                            onChange={(e) => this.onInputChange(e, task)} />
                                    </Form.Group>
                                </Form>
                                <div className="float-right">
                                    <Button name={"next-" + task.id} className="mr-2"
                                        onClick={(e) => this.onNextActionClick(e,task)}><MdSkipNext size={28} /></Button>
                                    <Button name={"postpone-" + task.id} className="mr-2" variant="warning" 
                                        onClick={(e) => this.onPostponeButtonClick(e)}
                                        onBlur={(e) => this.onPostponeButtonBlur(e)}><MdAlarm size={28} /></Button>
                                    <Button name={"complete-" + task.id} variant="success"
                                        onClick={(e) => this.onCompleteButtonClick(e,task)}><MdCheck size={28} /></Button>
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