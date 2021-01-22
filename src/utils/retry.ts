import Logger from '../logger/Logger';

const logger = Logger.instance(__filename);

const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
    action: () => T | never,
    ignore?: any[],
    interval: number = 10000,
    maxAttempts: number = 3
): Promise<T> => {
    let throwableError, attempt = 1;
    while (attempt < maxAttempts + 1) {
        try {
            let result = await action();
            return result;
        } catch (error) {
            throwableError = error;
            if (ignore?.some(e => error instanceof e)) break;
            logger.warn(`Error: ${error.message}\nRetry #${attempt}.`);
        }
        await sleep(interval);
        interval += interval;
        attempt++;
    }

    throw throwableError;
};