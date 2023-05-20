import { Events, mapServiceProvider } from '@timing71/common';
import { v4 as uuid } from 'uuid';
import { connectionService } from './connectionService.js';
import { Recorder } from './record.js';

export const startCommand = (source, options) => {
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

  const recorder = options.record ? new Recorder(myUUID) : null;

  if (recorder) {
    console.log(`Recording timing data to ${recorder.outputDirectory}`);
  }

  const onStateChange = (state) => {

    recorder?.addFrame(state);

    if (options.table) {
      console.clear();
      console.table(
        [
          (state.manifest?.colSpec || []).map(m => m[0]),
          ...(state.cars || [])
        ]
      );
    }

  };

  const onManifestChange = (manifest) => {
    recorder?.writeManifest(manifest);
  }

  const service = new serviceClass(serviceDef);

  service.on(Events.STATE_CHANGE, onStateChange);
  service.on(Events.MANIFEST_CHANGE, onManifestChange);

  service.start(connectionService);
}
