import { Events, Severity, mapServiceProvider } from '@timing71/common';
import { createAnalyser } from '@timing71/common/analysis';
import { v4 as uuid } from 'uuid';
import { connectionService } from './connectionService.js';
import { Recorder } from './record.js';
import { WebsocketServer } from './server.js';

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

  let recorder = options.record ? new Recorder(myUUID) : null;

  const analysis = createAnalyser(undefined, true);
  let prevState = {};
  const server = options.websocketServer ? new WebsocketServer({ analysis, port: options.port }) : null;

  if (recorder) {
    console.log(`Recording timing data to ${recorder.outputDirectory}`);
  }

  if (server) {
    console.log(`Started WebSocket server on port ${server.address.port}`);
  }

  const onStateChange = (state) => {

    analysis.updateState(prevState, state);
    prevState = { ...state };
    recorder?.addFrame(state);
    server?.updateState(state);

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
    server?.updateManifest(manifest);
  }

  const onSessionChange = (sessionIndex) => {
    console.info(`Session change #${sessionIndex}`);
    analysis.reset();
    if (options.record) {
      recorder = new Recorder(`${myUUID}_${sessionIndex}`);
      console.log(`Recording timing data to ${recorder.outputDirectory}`);
    }
  }

  const service = new serviceClass(serviceDef);

  service.on(Events.STATE_CHANGE, onStateChange);
  service.on(Events.MANIFEST_CHANGE, onManifestChange);
  service.on(Events.SESSION_CHANGE, onSessionChange);
  service.on(Events.SYSTEM_MESSAGE, logSystemMessageToConsole);

  service.start(connectionService);
}

function logSystemMessageToConsole(msg) {
  let consoleMethod = 'log';
  switch (msg.severity) {
    case Severity.DEBUG:
      consoleMethod = 'debug';
      break;
    case Severity.INFO:
      consoleMethod = 'info';
      break;
    case Severity.WARNING:
      consoleMethod = 'warn';
      break;
    case Severity.ERROR:
      consoleMethod = 'error';
      break;
    default:
      consoleMethod = 'log';
  }
  console[consoleMethod](msg.message); // eslint-disable-line no-console
}
