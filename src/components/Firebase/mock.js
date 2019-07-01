class FirebaseMock {
    constructor() {
        this.auth = { onAuthStateChanged: (callback) => { 
            callback(this.emptyUser);
            return () => {};
        } };
        this.emptyUser = { displayName: '<mock>' };
        this.isMock = true;

    
        this.tasks = [
            { id: 0, topic: 'topic1', action: 'actionable item out of date', due: new Date(Date.now() - 100000000), created: new Date(), modified: new Date(Date.now()- 4000000000)  },
            { id: 1, topic: 'topic2', action: 'another great actionable item', due: new Date(Date.now() + 100000000), created: new Date()  },
            { id: 2, topic: 'topic2', action: 'actionable belonging to the same topic', due: new Date(Date.now()), created: new Date()  },
            { id: 3, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date()  },
            { id: 4, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date()  },
            { id: 5, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date()  },
            { id: 6, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date()  },
            { id: 7, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date()  },
            { id: 8, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date()  },
            { id: 9, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date()  },
            { id: 10, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date() },
            { id: 11, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 12, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 13, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 14, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 15, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 16, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 17, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 18, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 19, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 20, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 21, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
            { id: 22, topic: 'topic3', action: 'actionable far far away', due: new Date(Date.now() + 800000000), created: new Date(Date.now() - 100000000)},
        ];

        this.onTaskListUpdate = [];

        this.idCounter = this.tasks.length;
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

        if (foundIndex !== -1) {
            this.tasks[foundIndex] = { id: taskid, topic: newtopic, action: newaction };
            this.fireTaskListUpdate();
        }
    }

    newTask = (newtopic, newaction, duedate) => {
        this.tasks.push({ id: this.idCounter++, topic: newtopic, action: newaction, due: duedate });

        this.fireTaskListUpdate();
    }

    completeTask = (taskid) => {
        let foundIndex = this.findTask(taskid);

        if (foundIndex !== -1) {
            this.tasks.splice(foundIndex, 1);
            this.fireTaskListUpdate();
        }
    }

    signOut = () => {
        console.log("Ignored: Signout");
    }

}

export default FirebaseMock;