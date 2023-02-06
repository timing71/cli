import { mapServiceProvider } from '@timing71/common';
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

  const service = new serviceClass(console.log, console.log, serviceDef);
  service.start(connectionService);
}
