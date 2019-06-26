import React, { Component } from 'react';
import Toast from 'react-bootstrap/Toast';
import Button from 'react-bootstrap/Button';

class UndoDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false
        };
    }

    componentDidMount() {
        this.props.undoer.onUndoAdded = () => {
            this.setState({ show: true });
        }
    }

    onClose = () => {
        this.setState({ show: false });
        this.props.undoer.expireUndo();
    }

    onUndoClick = (event) => {
        this.setState({ show: false });
        let task = this.props.undoer.taskUndo();
        if (this.props.onUndo) this.props.onUndo(task);
    }

    render() {
        // TODO: Temp workaround since toaster blocks input even when hidden
        if (this.state.show) {
            return (
                <div className="d-flex justify-content-center">
                <Toast 
                    delay={3000} show={this.state.show} autohide onClose={this.onClose}
                    style={{ position: 'absolute', top: 150 }}
                    className="border"
                    >
                    <Toast.Header className="bg-light">
                        Task Completed
                    </Toast.Header>
                    <Toast.Body className="bg-light">
                    <Button variant="link" className="p-0 align-baseline" size="sm"
                        onClick={(e) => this.onUndoClick(e)}>I regret!</Button>
                    </Toast.Body>
                </Toast>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default UndoDialog;