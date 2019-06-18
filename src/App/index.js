import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/app';

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

import { MdLineStyle, MdWarning, MdAlarm, MdCheck, MdAddCircleOutline, MdHighlightOff } from 'react-icons/md';

import { DAY_ADD, alignDate, getDates, toDateString } from '../utils/dateutils';

// TODO: Split into more managable components...
// TODO: Failure handling

class App extends React.Component {
    uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
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

    initialState = {
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
    }

    warnTaskCount = 20;
    warnStaleDays = 20;
    keySeparator = '_';

    filterDefinitions = {
        today: (task, today) => { return (alignDate(task.due).valueOf() <= today) },
        week: (task, today) => { return (alignDate(task.due).valueOf() <= (today + (7 * DAY_ADD))) } ,
        all: () => { return true }
    }

    savedInput = null;

    constructor(props) {
        super(props);
    
        this.state = { ...this.initialState, authUser: props.firebase.emptyUser }
    }

    isStale = (task) => {
        if (!task.modified) return false;

        const today = alignDate(new Date()).valueOf();

        return (alignDate(task.modified).valueOf() + (this.warnStaleDays * DAY_ADD) <= today);
    }

    // Listen to the Firebase Auth state and set the local state.
    componentDidMount() {
        this.setState({dates: getDates()});

        this.unregisterAuthObserver = this.props.firebase.auth.onAuthStateChanged(
            (user) => {
                if (user) {
                    this.setState({ authUser: user });
                    this.props.firebase.registerTaskListUpdate(this.onTaskListUpdate, user);       
                }
            }
        );
    }
    
    // Make sure we un-register Firebase observers when the component unmounts.
    componentWillUnmount() {
        this.unregisterAuthObserver();
        this.props.firebase.unregisterTaskListUpdate(this.onTaskListUpdate);
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

        const newCounters = {};

        Object.keys(this.filterDefinitions).forEach((key) => {
            let filterCount = list.reduce((accumulator, task) => {
                accumulator += (this.filterDefinitions[key](task, today) ? 1 : 0);
                return accumulator;
            }, 0);

            newCounters[key] = filterCount;
        });

        this.setState({ filterCounters: newCounters });
    }

    onTaskListUpdate = (list) => {
        this.setState({ tasks: list });
        this.updateFilterCounters(list);
        this.applyFilters(list, this.state.selectedFilter);
    }

    signOut = () => {
        this.setState(this.initialState);
        this.setState({dates: getDates()});
        this.setState({ authUser: this.props.firebase.emptyUser });
        this.props.firebase.signOut();        
    }
    
    newTask = () => {
        this.props.firebase.newTask(this.state.addTopic, this.state.addAction, this.state.addDate);
        this.setState({ addTopic: "", addAction: "" });
    }

    onFilterButton = (value) => {
        this.setState({ selectedFilter: value });
        this.applyFilters(this.state.tasks, value);
    }

    onInputChange = (event, task) => {
        let name = null;
        const value = event.target.value;
        const pos = event.target.name.indexOf(this.keySeparator);
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
                    item.dirty = true;
                }

                return item;
            });

            return tasks;
        });
    }

    saveInput = (toSave) => {
        this.savedInput = toSave;
    }

    clearSavedInput = () => {
        this.savedInput = null;
    }

    onInputKeyDown = (event, task, name) => {
        if (this.savedInput && event.key === "Escape") {
            this.setState(state => {
                const tasks = state.tasks.map((item) => {
                    if (task.id === item.id) {
                        item[name] = this.savedInput;
                    }
    
                    return item;
                });
    
                return tasks;
            });
        }
    }

    onInputKeyPress = (event, task) => {
        if (event.key === "Enter") { 
            event.preventDefault();
            this.props.firebase.updateTask(task); 
        }
        else if (event.key === "Escape" && this.savedInput)
        {
            task.topic = this.savedInput;
            this.props.firebase.updateTask(task); 
        }
    }

    onTextAreaKeyPress = (event, task) => {
        if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            this.props.firebase.updateTask(task)
        }
    }

    onCardBlur = (event,task) => {
        if (task.dirty) {
            this.props.firebase.updateTask(task);
        }
    }

    onPostponeButtonClick = (event) => {
        this.setState({ showPostpone: !this.state.showPostpone, targetPostpone: event.currentTarget });
    }

    onPostpone = (event, date) => {
        let name = this.state.targetPostpone.name;
        const pos = name.indexOf(this.keySeparator);

        let key = null;

        if (pos !== -1) {
            key = name.substr(pos + 1);
        }
        else {
            return;
        }

        this.setState({ showPostpone: false });

        this.state.tasks.forEach((task) => {
            if (task.id === key) {
                task.due = date;
                this.props.firebase.updateTask(task);
            }
        });
    }

    onPostponeButtonBlur = (event) => {
        this.setState({ showPostpone: false });
    }

    onCompleteButtonClick = (event, task) => {
        this.props.firebase.completeTask(task.id);
    }

    onNewButtonClick = (event) => {
        this.newTask();
    }

    onNewActionKeyPress = (event, task) => {
        if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            this.newTask();
        }
    }

    onNewTopicKeyPress = (event) => {
        if (event.key === "Enter") {
            event.preventDefault()
        }
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
        else if (due === today) {
            return "success";
        }
        else if (due <= week) {
            return "primary";
        }

        return "info";
    }

    renderFilterButton = (name, filter, bsVariant) => {
        let isAboveLimit = (this.state.filterCounters[filter] >= this.warnTaskCount);

        return (
        <ToggleButton type="radio" value={filter} variant={bsVariant} className="w-100 filterbutton">
            {name}
            <br />
            <Badge variant={isAboveLimit ? 'danger' : 'secondary'} className="border border-dark">
                {this.state.filterCounters[filter]}
                {isAboveLimit && <MdWarning className="float-right"/>}
            </Badge>
        </ToggleButton>
        );
    }

    render() {
        if (!this.state.authUser) {
            return (
            <JumboTron>
                <h1 className="text-center mb-5">Welcome to Grabtangle!</h1>
                <p id="LoginLoader" className="text-center">Loading...</p>
                <StyledFirebaseAuth uiCallback={ui => ui.disableAutoSignIn()} uiConfig={this.uiConfig} firebaseAuth={this.props.firebase.auth} />
            </JumboTron>
            );
        }
        return (
        <Container>
            <Navbar bg="light" sticky="top">
            <div className="w-100">
                <Navbar.Brand><MdLineStyle className="mb-1 mr-2" size={32} />Grabtangle</Navbar.Brand>
                <Navbar.Text className="float-right">
                    Hi, <span className="text-white">{this.state.authUser.displayName}</span>
                    <Button variant="link" className="p-0 align-baseline" onClick={(e) => this.signOut() }><MdHighlightOff size={22}/></Button>
                </Navbar.Text>
                <ButtonToolBar className="mt-1 d-flex flex-column">
                    <ToggleButtonGroup name="filter" value={this.state.selectedFilter} onChange={(value) => this.onFilterButton(value)}>
                        <OverlayTrigger trigger="click" placement="bottom-start" overlay={
                            <Popover title='Add new task'>
                                <Form>
                                    <Form.Group>
                                        <Form.Label>Topic</Form.Label>
                                        <Form.Control type="input" 
                                            onChange={(e) => this.onNewTopicChange(e)} 
                                            onKeyDown={(e) => this.onNewTopicKeyPress(e)}
                                            value={this.state.addTopic}></Form.Control>
                                        <Form.Label className="mt-1">Next action</Form.Label>
                                        <Form.Control as="textarea" 
                                            onChange={(e) => this.onNewActionChange(e)} 
                                            onKeyDown={(e) => this.onNewActionKeyPress(e)}
                                            value={this.state.addAction}></Form.Control>
                                        <Button className="mt-2 mb-1" variant="success" 
                                            onClick={(e) => this.onNewButtonClick(e)} 
                                            disabled={this.state.addTopic.length === 0 || this.state.addAction.length === 0}>Add</Button>
                                        <h5 className="float-right mt-2">
                                            <small className="mr-2">Due date</small>
                                            <Badge variant={this.dateToVariant(this.state.addDate)}>{toDateString(this.state.addDate)}</Badge>
                                        </h5>
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
                            <Button variant="secondary" className="w-25"><MdAddCircleOutline size={24}/></Button>
                        </OverlayTrigger>
                        {this.renderFilterButton('Today', 'today', 'success')}
                        {this.renderFilterButton('Week', 'week', 'primary')}
                        {this.renderFilterButton('All', 'all', 'info')}
                   </ToggleButtonGroup>
                </ButtonToolBar>
            </div>
            </Navbar>

            <Overlay show={this.state.showPostpone} target={this.state.targetPostpone} placement="top" containerPadding={20}>                    
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
                        <Accordion.Toggle as={Card.Header} eventKey={task.id}>
                            <Card.Title>{task.topic}
                                <Badge className="float-right" variant={this.dateToVariant(task.due)}>{toDateString(task.due)}</Badge>
                                {this.isStale(task) && 
                                <Badge className="float-right mr-2" variant="danger">Stale</Badge>
                                }
                            </Card.Title>
                            <Card.Subtitle className="text-truncate">{task.action}</Card.Subtitle> 
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={task.id}>
                            <Card.Body className="clearfix">
                                <Form onBlur={(e) => this.onCardBlur(e,task)}>
                                    <Form.Group controlId="control0">
                                        <Form.Control name={"topic" + this.keySeparator + task.id} className="mb-1" type="text" value={task.topic} 
                                            onChange={(e) => this.onInputChange(e, task)}
                                            onKeyPress={(e) => this.onInputKeyPress(e, task)} 
                                            onFocus={(e) => this.saveInput(task.topic)}
                                            onBlur={(e) => this.clearSavedInput()}
                                            onKeyDown={(e) => this.onInputKeyDown(e, task, 'topic')}
                                            />
                                        <Form.Control name={"action" + this.keySeparator + task.id} as="textarea" rows="3" value={task.action} 
                                            onChange={(e) => this.onInputChange(e, task)}
                                            onKeyPress={(e) => this.onTextAreaKeyPress(e, task)}
                                            onFocus={(e) => this.saveInput(task.action)}
                                            onBlur={(e) => this.clearSavedInput()}
                                            onKeyDown={(e) => this.onInputKeyDown(e, task, 'action')}
                                             />
                                    </Form.Group>
                                </Form>
                                <small className="d-none d-md-inline">
                                    Press <code className="text-dark bg-secondary">Shift</code> + <code className="text-dark bg-secondary">Enter</code> to save immediately.
                                    Restore original input with <code className="text-dark bg-secondary">Esc</code>.
                                </small>
                                <div className="float-right">
                                    <Button name={"postpone" + this.keySeparator + task.id} className="mr-2" variant="warning" 
                                        onClick={(e) => this.onPostponeButtonClick(e)}
                                        onBlur={(e) => this.onPostponeButtonBlur(e)}><MdAlarm size={28} /></Button>
                                    <Button name={"complete" + this.keySeparator + task.id} variant="success"
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