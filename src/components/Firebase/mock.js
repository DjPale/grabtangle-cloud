class FirebaseMock {
    constructor() {
        this.auth = { onAuthStateChanged: () => { 
            console.log("Ignored: onAuthStateChanged");
            return () => {} 
        } };
        this.emptyUser = { displayName: '<mock>' };
        this.isMock = true;

    
        this.tasks = [
            { id: 0, topic: 'topic1', action: 'actionable item', due: new Date(Date.now()) },
            { id: 1, topic: 'topic2', action: 'another great actionable item', due: new Date(Date.now()) }
        ];

        this.onTaskListUpdate = [];
    }

    registerTaskListUpdate = (callback) => {
        this.onTaskListUpdate.push(callback);

        callback(this.tasks);
    }

    fireTaskListUpdate = () => {
        this.onTaskListUpdate.map((callback) => {
            callback(this.tasks);
        })
    }

    updateTask = (taskid, newtopic, newaction) => {
        this.tasks[taskid] = { id: taskid, topic: newtopic, action: newaction };
     
        this.fireTaskListUpdate();
    }

    newTask = (newtopic, newaction) => {
        this.tasks.push({ id: this.tasks.length, topic: newtopic, action: newaction });

        this.fireTaskListUpdate();
    }

    completeTask = (taskid) => {

    }

    signOut = () => {
        console.log("Ignored: Signout");
    }

}

export default FirebaseMock;