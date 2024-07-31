

const Receiver = {
    projectWorm: null,
    projectState: null,
    cachedProjectState: null,
    projectReady: false,
    __requestProject: function() {
        window.parent.postMessage({type: 'requestProject'}, '*');

    },
    __handleProject: function(project :any) {
        this.projectWorm = project.worm;
        this.projectState = project.state;
        this.cachedProjectState = structuredClone(project.state);
        this.projectReady = true;
    },
    __handleUpdate: function(update :any) {
        if (update.type === 'project') {
            this.__handleProject(update.project);
        } else if (this.projectReady) {
            
        }
    },
    init() {
        window.addEventListener('message', (event) => {this.__handleUpdate(event.data)});

    },
    getSignalFunction: function() {
        return function() {
            
        }
    },
    findSignalId: function(folder : string,signalName : string) {

    },
    getSignalValue: function(signalId : string) {
        return 1;
    }
}

export default Receiver;