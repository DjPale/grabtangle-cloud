import app from 'firebase/app';
import Firebase from 'firebase';
import 'firebase/auth';

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_AUTH_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
  };

class FirebaseStore {
    constructor() {
        app.initializeApp(config);

        this.auth = app.auth();
        this.db = app.database();

        this.emptyUser = null;

        
        this.onTaskListUpdate = [];

        this.tasksRef = null;
    }

    onListChange = (snapshot) => {
        const taskListObject = snapshot.val();

        if (!taskListObject) return;

        const taskList = Object.keys(taskListObject).map(key => ({
            id: key,
            topic: taskListObject[key].topic,
            action: taskListObject[key].action,
            due: new Date(Date.parse(taskListObject[key].due)),

        }));

        this.fireTaskListUpdate(taskList);
    }

    fireTaskListUpdate = (taskList) => {
        this.onTaskListUpdate.forEach((callback) => {
            callback(taskList);
        })
    }

    registerTaskListUpdate = (callback, user) => {
        this.onTaskListUpdate.push(callback);

        let uid = user.uid;

        if (!this.tasksRef) {
            this.tasksRef = this.db.ref(`tasks/${uid}`);

            this.tasksRef.once('value', (snapshot) => {
                if (!snapshot.exists()) {
                    this.db.ref('tasks').set(uid).then(() => this.tasksRef.on('value', this.onListChange));
                } else {
                    this.tasksRef.on('value', this.onListChange);
                }
            });
        }
    }

    unregisterTaskListUpdate = () => {
        console.log("Ignored: unregisterTaskListUpdate");        

        if (this.onTaskListUpdate.length === 0 && this.tasksRef) {
            this.tasksRef.off();
            this.tasksRef = null;
        }
    }

    toDatabaseTimestamp = (date) => {
        return date.toISOString();
    }


    newTask = (newtopic, newaction, duedate) => {
        this.tasksRef.push({ 
            created: Firebase.database.ServerValue.TIMESTAMP,
            topic: newtopic, 
            action: newaction, 
            due: this.toDatabaseTimestamp(duedate)
        });
    }

    completeTask = (taskid) => {
        this.tasksRef.child(taskid).remove();
    }

    updateTask = (task) => {
        this.tasksRef.child(task.id).update({
            topic: task.topic,
            action: task.action,
            due: this.toDatabaseTimestamp(task.due)
        });
    }

    signOut = () => {  
        if (this.tasksRef) {
            this.tasksRef.off();
            this.tasksRef = null;
        }
        this.onTaskListUpdate = [];
        this.auth.signOut();
    }
}

export default FirebaseStore;