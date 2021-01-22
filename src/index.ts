import fs from 'fs'

import ConfigReader from './data/ConfigReader';
import { App } from './App';

//const logger = Logger.instance(__filename);
App.run()

process.on('uncaughtException', (err) => {
    console.log(err)
   /// logger.error('FATAL ERROR (uncaughtException).');
//    logger.error(err.message);
   // logger.error('Process termination...');
    process.exit();
});

process.on('unhandledRejection', (reason) => {
    console.log(reason)
  //  logger.error('FATAL ERROR (promise rejection).');
  ////  logger.error('%O', reason);
  //  logger.error('Process termination...');
    process.exit();
});

process.on('exit', () => {
   // logger.info('Process has been finished.');
});