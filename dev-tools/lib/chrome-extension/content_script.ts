import { createChannel } from '../core/channel';
import Bridge from '../core/Bridge';

window.__REACT_VIEWPORT_UTILS_BRIDGE__ =
  window.__REACT_VIEWPORT_UTILS_BRIDGE__ || new Bridge();

createChannel(chrome.runtime.sendMessage);
