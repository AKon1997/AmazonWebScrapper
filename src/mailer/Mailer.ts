import os from 'os';
import fs from 'fs';
import path from 'path';
import util from 'util';
import nodemailer from 'nodemailer';
import MailAPI, { Attachment } from 'nodemailer/lib/mailer';
import {retry} from '../utils/retry';
import Logger from '../logger/Logger';


export enum MessageType {
    StartFailed = 'Letter1',
    InvalidInput = 'Letter2',
    Completed = 'Letter5'
}

export default class Mail {

    protected _logger = Logger.instance(__filename);
    protected _to: string;
    protected _cc: string;
    protected _transport: MailAPI;

    constructor(to: string,  cc : string, sender : string, password : string) {
        this._to = to
        this._cc = cc
        this._transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 25,
            auth: {
                user: sender,
                pass: password
            }
        });
    }

    async send(
        subject : string,
        messageContent : string,
        attachments: string[] = []
    ): Promise<void> {
        let message: MailAPI.Options = this.message(subject,messageContent,attachments)
        try {
            await retry(async () => await this._transport.sendMail(message));
        } catch (error) {
            console.log(error.message)
            this._logger.warn('Failed to send email. ' + error.message);
        }
    }

    protected message(messageSubject: string, messageContent:string, attachments: string[]): MailAPI.Options {
        let message: MailAPI.Options = {
            to: [this._to],
            cc : this._cc,
            subject: messageSubject,
            html: messageContent
        };
        this.addAttachments(message, attachments);
        return message;
    }

    protected addAttachments(
        options: MailAPI.Options,
        files: string[]
    ): MailAPI.Options {
        let attachments: Attachment[] = [];
        for (const file of files) {
            if (fs.existsSync(file)) {
                attachments.push({
                    filename: path.basename(file),
                    content: fs.createReadStream(file)
                });
            }
        }

        options.attachments = attachments;

        return options;
    }

}