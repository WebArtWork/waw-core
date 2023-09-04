class Event {
	constructor() {
		this.eventListeners = new Map();
	}

	// Function to emit an event with a name and data
	emit(eventName, eventData) {
		if (!this.eventListeners.has(eventName)) {
			this.eventListeners.set(eventName, []);
		}

		const listeners = this.eventListeners.get(eventName);
		for (const listener of listeners) {
			listener(eventData);
		}
	}

	// Function to listen for an event and receive data
	on(eventName, callback) {
		if (!this.eventListeners.has(eventName)) {
			this.eventListeners.set(eventName, []);
		}

		const listeners = this.eventListeners.get(eventName);
		listeners.push(callback);
	}

	// Function to check if an event has been emitted at least once
	hasEmitted(eventName) {
		return this.eventListeners.has(eventName);
	}
}

export default new Event();
