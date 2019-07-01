import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';

class UndoDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            progress: 100,
            heading: 'Undo'
        };
    }

    intervalRes = 200;

    componentDidMount() {
        this.props.undoer.onUndoAdded = (title) => {
           this.showDialog(title);
        }

        if (this.props.defaultShow) {
            this.showDialog(this.state.heading);
        }

    }
  
    componentWillUnmount() {
        this.dismissTimerHandle();
    }

    onIntervalTick = () => {
        this.progressCounter -= this.intervalRes;

        this.setState({ progress: this.progressCounter / this.props.delay * 100.0 });

        if (this.progressCounter <= 0) {
            this.onClose();
        }
    }

    setupTimers = () => {
        if (this.props.delay) {
            this.progressCounter = this.props.delay;
            this.setState({ progress: 100 });
            this.timerHandle = setInterval(this.onIntervalTick, this.intervalRes);
        }
    }

    dismissTimerHandle = () => {
        if (this.timerHandle != null) {
            clearInterval(this.timerHandle);
            this.timerHandle = null;
        }
    }

    showDialog = (title) => {
        this.setState({ show: true, heading: title });
        this.setupTimers();
    }

    onClose = () => {
        this.setState({ show: false });
        this.props.undoer.expireUndo();
        this.dismissTimerHandle();
    }

    onUndoClick = (event) => {
        let task = this.props.undoer.taskUndo();
        if (this.props.onUndo) this.props.onUndo(task);
        this.onClose();
    }

    render() {
        // TODO: Temp workaround since toaster blocks input even when hidden
        //if (this.state.show) {
            return (
                <Alert 
                    show={this.state.show} onClose={this.onClose}
                    variant="secondary"
                    style={{ position: 'absolute', top: 140}}
                    className="border"
                    dismissible
                    >
                    <Alert.Heading>{this.state.heading}</Alert.Heading>
                    <p>If this was a mistake, you can re-add the task again!</p>
                    { true && <ProgressBar now={this.state.progress} />}
                    <br />
                    <Button className="float-right"
                        onClick={(e) => this.onUndoClick(e)}>Undo</Button>
                </Alert>
            );
        //} else {
        //    return null;
        //}
    }
}

export default UndoDialog;