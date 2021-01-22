import fs from 'fs'
import path from 'path'
import util from 'util'
import os from 'os';
import { Config } from './utils/Config';
import Mailer from './mailer/Mailer';
import ConfigReader from './data/ConfigReader';
import ExcelService from './excel/ExcelService';
import { InputRow } from './utils/InputRow';
import puppeteer from 'puppeteer'
import { MainPage } from './Amazon/Amazon-PageObjects/MainPage';
import { SearchPage } from './Amazon/Amazon-PageObjects/SearchPage';
import { AmazonProcessingService } from './Amazon/amazonProcessingService';
import { ResultRow } from './utils/ResultRow';

export class App {

    private static mailer: Mailer;
    private static templates: any;
    private static pathToTemplate: string;
    private static pathToPopulatedFile : string
    private static Config: Config;
    private static settings: any;
    private static rows: InputRow[]


    static async run(): Promise<void> {
        if(await App.init()){
            let amazonService = new AmazonProcessingService(App.rows)
            await amazonService.runService()
            let results = amazonService.getServiceResult()
            console.log(Object.keys(results).length === 0 )
            if(Object.keys(results).length != 0){
                App.reportCreating(results)
                if(App.Config.outputFileFolder.length == 0){
                    await App.mailer.send(App.templates.finishRunSend.subject,App.templates.finishRunSend.body, [App.pathToPopulatedFile])
                }
                else{
                    App.Config.outputFileFolder = path.resolve(App.Config.outputFileFolder, "result.xlsx")
                    await App.mailer.send(App.templates.finishRunFileMoved.subject, util.format(App.templates.finishRunFileMoved.body, App.Config.outputFileFolder))
                    fs.copyFileSync(App.pathToPopulatedFile, App.Config.outputFileFolder)
                }
            }
            else{
                await App.mailer.send(App.templates.inputFileNotValid.subject,App.templates.inputFileNotValid.body)
            }
            console.log()
            process.exit()
        }
    }

    static async init(): Promise<boolean> {
        let settingFile = path.resolve(process.cwd(), "src", "settings", "settings.json")
        App.settings = JSON.parse(fs.readFileSync(settingFile).toString())

        let templateFile = path.resolve(process.cwd(), "src", "settings", "templates.json")
        App.templates = JSON.parse(fs.readFileSync(templateFile).toString())

        App.pathToTemplate =  path.resolve(process.cwd(), "template", "Amazon Result.xlsx")

        let configPath = path.resolve(process.cwd(), "inputs", "config.json")
        if (!fs.existsSync(configPath)) {
            console.warn("No config file present. Terminating process")
            return false
        }

        let configReader = new ConfigReader(configPath)
        if (!configReader.tryReadFile()) {
            return false
        }

        App.Config = configReader.getAssets()
        let missingAssets = configReader.getMissingAssets()
        if (missingAssets.length > 0) {
            console.log(util.format("Did not found following resources: %s", missingAssets.join(",")))
            if (App.Config.emailForReports && App.Config.userEmail && App.Config.userPassword) {
                App.mailer = new Mailer(App.Config.emailForReports, "", App.Config.userEmail, App.Config.userPassword)
                let message = util.format(App.templates.initValidationFailed.body, missingAssets.join(","))
                await App.mailer.send(App.templates.initValidationFailed.subject, message)
            }
            return false
        }
        App.mailer = new Mailer(App.Config.emailForReports, "", App.Config.userEmail, App.Config.userPassword)
        if(! fs.existsSync(App.Config.inputFile)){
            await App.mailer.send(this.templates.inputFileNotFound.subject, this.templates.inputFileNotFound.body)
            return false
        }

        let excelService = new ExcelService(App.Config.inputFile, App.settings.sheetName, App.settings.columnNames)
        App.rows = await excelService.inputValidation()
        if (App.rows.length == 0) {
            let msg = util.format(this.templates.inputFileNotValid.body, excelService.getFailureReason())
            await App.mailer.send(this.templates.inputFileNotValid.subject, msg)
            return false
        }
        return true


    }




    static reportCreating(results : {[key: string] : ResultRow[]}) {
        App.pathToPopulatedFile = path.resolve(process.cwd(), "Amazon Scraper Result.xlsx")
        fs.copyFileSync(App.pathToTemplate, App.pathToPopulatedFile)
        let excelService = new ExcelService(App.pathToPopulatedFile)
        for(const [sheetName, rows] of  Object.entries(results)){
            excelService.writeOutputFile(sheetName,rows)
        }
        excelService.deleteSheet()
        console.log()
    }
}