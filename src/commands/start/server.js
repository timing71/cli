import { WebSocketServer } from 'ws';

export class WebsocketServer {
  constructor({ analysis, port=24771 } = {}) {
    this._state = {};
    this._manifest = {};
    this._server = new WebSocketServer({ port });

    this.updateManifest = this.updateManifest.bind(this);
    this.updateState = this.updateState.bind(this);
    this._sendToAllClients = this._sendToAllClients.bind(this);

    this._server.on('connection', (client) => {
      client.send(JSON.stringify({ type: 'MANIFEST_UPDATE', manifest: this._manifest }));
      client.send(JSON.stringify({ type: 'STATE_UPDATE', state: this._state }));
      client.send(JSON.stringify({ type: 'ANALYSIS_STATE', data: analysis.toJSON() }));
    });
  }

  get address() {
    return this._server.address();
  }

  updateManifest(manifest) {
    this._manifest = { ...manifest };
    this._sendToAllClients(
      JSON.stringify({
        type: 'MANIFEST_UPDATE', manifest: this._manifest
      })
    );
  }

  updateState(state) {
    this._state = { ...state };
    if (this._state.manifest) {
      this._manifest = { ...this._state.manifest };
    }
    delete this._state.manifest;

    const stringState = JSON.stringify({ type: 'STATE_UPDATE', state: this._state });

    this._sendToAllClients(stringState);

  }

  _sendToAllClients(messageString) {
    this._server.clients.forEach(
      client => {
        try {
          client.send(messageString);
        }
        catch (e) {
          console.error(e);
        }
      }
    );
  }
}
