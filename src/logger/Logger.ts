import path from 'path';
import util from 'util';
import winston, { format } from 'winston';
import fs from 'fs'

class Logger {
    private static level: string;
    private static loggers: winston.Container = new winston.Container();

    private constructor() {
        Logger.defineLevel();

    }

    private static defineLevel(): void {
        this.level =  'debug';
    }

    static instance(id: string): winston.Logger {
        if (this.loggers.has(id)) {
            return this.loggers.get(id);
        }
        return this.addLogger(id);
    }

    private static addLogger(id: string): winston.Logger {
        
        return this.loggers.add(id, {
            level: this.level,
            format: this.format(id),
            transports: [
                new winston.transports.Console({
                    format: format.colorize({ all: true })
                }),
                new winston.transports.File({ filename: 'run.log' })
            ]
        });
    }

    private static format(name: string) {
        return format.combine(
            format.splat(),
            format.label({ label: path.basename(name) }),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(info => util.format(
                '%s [%s] %s: %s',
                info.timestamp,
                info.label,
                info.level,
                info.message))
        );
    }
}

export default Logger;