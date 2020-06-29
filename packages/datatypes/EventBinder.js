/* Simulates EventEmitter base, binds to and extends a given primitive type

*/
class EventBinder {
    listeners = {};
    
    addListener(eventName, fn) {
        // eval if listener has already been registered
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(fn);
        return this;
    }

    // alias for `addListener` method
    on(eventName, fn) {
        return this.addListener(eventName, fn);
    }
    
    removeListener(eventName, fn) {
        let listeners = this.listeners[eventName];
        for (let i = listeners.length; i > 0; i--) {
            if (listeners[i] === fn) {
                listeners.splice(i,1);
                break;
            }
        }
        return this;
    }

    // alias for `removeListener` method
    off(eventName, fn) {
        return this.removeListener(eventName, fn);
    }
    
    once(eventName, fn) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        const executeOnceWrapper = () => {
            fn();
            this.off(eventName, executeOnceWrapper);
        }
        this.listeners[eventName].push(executeOnceWrapper);
        return this;
    }
    
    emit(eventName, ...args) { 
        let listeners = this.listeners[eventName];
        if (!listeners) {
            return false;
        }
        listeners.forEach(method => {
            method(...args);
        });
        return true;
    }
    
    listenerCount(eventName) {
        let listeners = this.listeners[eventName] || [];
        return listeners.length;
    }
    
    rawListeners(eventName) {
        return this.listeners[eventName];
    }

}