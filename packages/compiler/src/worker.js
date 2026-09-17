import { handleTask } from './tasks.js';
self.addEventListener('message', event => handleTask(event.data, (value, transfer = []) => self.postMessage(value, transfer)));
