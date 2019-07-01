class UndoHandler {
    lastTask = null;

    // TODO: what's the pattern here really ?
    onUndoAdded = null;

    expireUndo = () => {
        this.lastTask = null;
    }

    taskUndo = () => {
        if (!this.lastTask) return null;

        let ret = Object.assign({}, this.lastTask);
        this.lastTask = null;

        return ret;
    }

    addUndo = (task) => {
        this.lastTask = Object.assign({}, task);
        if (this.onUndoAdded) this.onUndoAdded('Task Completed');
    }
}

export default UndoHandler;