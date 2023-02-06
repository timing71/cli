import { mapServiceProvider, processManifestUpdate, processStateUpdate } from '@timing71/common';
import { v4 as uuid } from 'uuid';
import { connectionService } from './connectionService.js';

export const startCommand = (source) => {
  const serviceClass = mapServiceProvider(source);

  if (!serviceClass) {
    console.error(`No service provider found to handle ${source}`);
    process.exit(1);
  }

  const myUUID = uuid();

  const serviceDef = {
    startTime: Date.now() / 1000,
    source,
    uuid: myUUID
  }

  let state = { };

  const onStateChange = (newState) => {
    state = processStateUpdate(state, newState);

    console.table(
      [
        (state.manifest?.colSpec || []).map(m => m[0]),
        ...(state.cars || [])
      ]
    );
  };

  const onManifestChange = (newManifest) => {
    processManifestUpdate(
      state.manifest,
      newManifest,
      serviceDef.startTime,
      serviceDef.uuid,
      (m) => {
        onStateChange({ manifest: m });
      }
    );
  };

  const service = new serviceClass(onStateChange, onManifestChange, serviceDef);
  service.start(connectionService);
}
