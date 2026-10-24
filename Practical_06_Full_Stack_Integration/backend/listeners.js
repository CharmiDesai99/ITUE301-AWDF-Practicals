const taskEvents = require('./events');

// Listener for 'task-created' event (Practical 10)
taskEvents.on('task-created', (task) => {
  console.log(
    `[Notification Handler] Task "${task.title}" (ID: ${task._id}) registered at ${new Date().toISOString()}`
  );

  // Artificial non-blocking background task (e.g., email notification / audit log)
  setTimeout(() => {
    console.log(
      `[Notification Worker] Background email dispatch finished for "${task.title}" at ${new Date().toISOString()}`
    );
  }, 400);
});

// Listener for 'task-deleted' event (Practical 10 Supplementary)
taskEvents.on('task-deleted', (task) => {
  console.log(
    `[Notification Handler] Task "${task.title || task._id}" permanently deleted at ${new Date().toISOString()}`
  );
});

// Listener for custom 'error' event to prevent uncaught exceptions
taskEvents.on('error', (err) => {
  console.error(`[Event Error] Unhandled event error caught: ${err.message}`);
});

console.log('✅ Task Event Listeners initialized successfully');
