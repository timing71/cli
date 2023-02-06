import '@timing71/common/polyfill';
import { Argument, Command } from 'commander';

import { rootLogger } from './logger.js';

import { servicesCommand } from './commands/services/index.js';
import { startCommand } from './commands/start/index.js';

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
   .action(startCommand)

export async function main(args) {

  try {
    await import('@timing71/services');
  }
  catch {
    // private @timing71/services package is optional
  }

  t71.parse(args);
}

main(process.argv);
