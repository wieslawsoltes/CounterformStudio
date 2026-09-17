import { parentPort } from 'node:worker_threads';
import { handleTask } from './tasks.js';
if (!parentPort) throw new Error('The Node compiler entry must run in a worker thread');
parentPort.on('message', value => handleTask(value, (message, transfer = []) => parentPort.postMessage(message, transfer)));
