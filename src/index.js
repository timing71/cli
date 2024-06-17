import '@timing71/common/polyfill';
import { Argument, Command, Option } from 'commander';

import { rootLogger } from './logger.js';

import { finaliseCommand } from './commands/finalise/index.js';
import { servicesCommand } from './commands/services/index.js';
import { startCommand } from './commands/start/index.js';
import { analyseCommand } from './commands/analyse/index.js';

const t71 = new Command();

t71.name('timing71')
  .description('Timing71 command-line client')
  .option('-d, --debug', 'Enable debug logging')
  .on('option:debug', () => {
    rootLogger.level = 'debug';
  });


t71.command('services')
  .description('List installed services')
  .action(servicesCommand)

t71.command('start')
  .description('Start running a timing service')
  .addArgument(
    new Argument('<source>', 'Timing source URL')
  )
  .option('-r, --record', 'Record timing to a directory')
  .option('--no-table', 'Don\'t display timing table')
  .option('-w, --websocket-server', 'Serve data via websocket')
  .addOption(new Option('-p, --port <port>', 'Port to run WebSocket server on').default(24771))
  .action(startCommand)

t71.command('finalise')
  .alias('finalize')
  .description('Finalise a recording directory into a Zip file')
  .addArgument(new Argument('<sourceDir>', 'Source directory'))
  .option('--rm', 'Remove source directory after creating Zip')
  .action(finaliseCommand);

t71.command('analyse')
  .alias('analyze')
  .description('Analyse a replay file and generate an analysis file')
  .addArgument(new Argument('<replayFile>', 'Replay file'))
  .action(analyseCommand);

export async function main(args) {

  try {
    await import('@timing71/services');
  }
  catch {
    // private @timing71/services package is optional
  }

  t71.parse(args);
}

// main(process.argv);
