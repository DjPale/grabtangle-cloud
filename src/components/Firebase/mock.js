class FirebaseMock {
    constructor() {
        this.auth = { onAuthStateChanged: () => { 
            console.log("Ignored: onAuthStateChanged");
            return () => {} 
        } };
        this.emptyUser = { displayName: '<mock>' };
        this.isMock = true;

    
        this.tasks = [
            { id: 0, topic: 'topic1', action: 'actionable item out of date', due: new Date(Date.now() - 100000000) },
            { id: 1, topic: 'topic2', action: 'another great actionable item', due: new Date(Date.now() + 100000000) },
            { id: 2, topic: 'topic2', action: 'actionable belonging to the same topic', due: new Date(Date.now()) },
            { id: 3, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000) }
        ];

        this.onTaskListUpdate = [];
    }

    registerTaskListUpdate = (callback) => {
        this.onTaskListUpdate.push(callback);

        callback(this.tasks);
    }

    unregisterTaskListUpdate = () => {
        console.log("Ignored: unregisterTaskListUpdate");
    }

    fireTaskListUpdate = () => {
        this.onTaskListUpdate.forEach((callback) => {
            callback(this.tasks);
        })
    }

    findTask = (taskid) => {
        let foundIndex = -1;
        
        this.tasks.forEach((task,index) => {
            if (task.id === taskid) {
                foundIndex = index;
            }
        });

        return foundIndex;
    }

    updateTask = (taskid, newtopic, newaction) => {
        let foundIndex = this.findTask(taskid);

        if (foundIndex != -1) {
            this.tasks[foundIndex] = { id: taskid, topic: newtopic, action: newaction };
            this.fireTaskListUpdate();
        }
    }

    newTask = (newtopic, newaction, duedate) => {
        this.tasks.push({ id: this.tasks.length, topic: newtopic, action: newaction, due: duedate });

        this.fireTaskListUpdate();
    }

    completeTask = (taskid) => {
        let foundIndex = this.findTask(taskid);

        if (foundIndex != -1) {
            this.tasks.splice(foundIndex, 1);
            this.fireTaskListUpdate();
        }
    }

    updateTaskList = (taskList) => {
        this.tasks = taskList;
        this.fireTaskListUpdate();
    }

    signOut = () => {
        console.log("Ignored: Signout");
    }

}

export default FirebaseMock;