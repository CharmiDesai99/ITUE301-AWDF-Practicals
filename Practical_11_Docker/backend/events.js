const EventEmitter = require('events');

// Custom EventEmitter class for Task Domain Events (Practical 10)
class TaskEvents extends EventEmitter {}

const taskEvents = new TaskEvents();

module.exports = taskEvents;
