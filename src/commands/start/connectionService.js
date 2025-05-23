import EventSource from 'eventsource';
import fetch from "cross-fetch";
import { JSDOM } from 'jsdom';
import ReconnectingEventSource from "reconnecting-eventsource";
import ReconnectingWebSocket from 'reconnecting-websocket';
import WebSocket from 'ws';


class WrappedReconnectingWebSocket extends ReconnectingWebSocket {

  on(event, handler) {
    return this.addEventListener(event, handler);
  }

  // Override superclass method to pass additional options to WebSocket constructor
  // (because we know we're nodejs not browser, we can do so)
  _connect() {
    if (this._connectLock || !this._shouldReconnect) {
      return;
    }
    this._connectLock = true;

    const {
      maxRetries = Infinity,
      connectionTimeout = 4000,
      ...otherOptions
    } = this._options;

    if (this._retryCount >= maxRetries) {
      this._debug('max retries reached', this._retryCount, '>=', maxRetries);
      return;
    }

    this._retryCount++;

    this._debug('connect', this._retryCount);
    this._removeListeners();

    this._wait()
      .then(() => this._getNextUrl(this._url))
      .then(url => {
        // close could be called before creating the ws
        if (this._closeCalled) {
          this._connectLock = false;
          return;
        }
        this._ws = new WebSocket(url, otherOptions);
        if (this._ws) {
          this._ws.binaryType = this._binaryType;
        }
        this._connectLock = false;
        this._addListeners();

        this._connectTimeout = setTimeout(() => this._handleTimeout(), connectionTimeout);
      });
  }

  _disconnect(code = 1000, reason) {
    this._clearTimeouts();
    if (!this._ws) {
      return;
    }
    this._removeListeners();
    try {
      this._ws.onerror = () => {};
      this._ws.close(code, reason);
      //this._handleClose(new CloseEvent(code, reason, this));
    } catch (error) {
      // ignore
    }
  }

}

export const connectionService = {
  fetch: async (url, { returnHeaders=false, ...options }={}) => {
    const response = await fetch(url, options);
    const text = await response.text();
    if (returnHeaders) {
      return [text, Object.fromEntries(response.headers.entries())];
    }
    return text;
  },

  createWebsocket: (url, { autoReconnect=true, protocols=[], ...options } = {}) => {
    if (autoReconnect) {
      return new WrappedReconnectingWebSocket(url, protocols, { WebSocket, ...options });
    }
    else {
      return new WebSocket(url, protocols, options);
    }
  },

  createDOMParser: () => {
    const jsdom = new JSDOM();
    const DOMParser = jsdom.window.DOMParser;
    return new DOMParser();
  },

  createEventSource: (url) => new ReconnectingEventSource(url, { eventSourceClass: EventSource })
};
