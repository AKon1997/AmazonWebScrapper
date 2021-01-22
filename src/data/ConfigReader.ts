import fs from 'fs'
import path from 'path'
import Logger from '../logger/Logger';
import { Config } from '../utils/Config';


export default class ConfigReader {

    protected logger = Logger.instance(__filename)
    protected filePath: string;
    protected fileObject: any;


    constructor(filePath: string) {
        this.filePath = filePath;
    }

    getAssets() : Config {
        let assets = new Config();
        Object.assign( assets,this.fileObject)
        return assets
    }

    getMissingAssets() : string[]{
        let reqParams = ["inputFile", "emailForReports","userEmail", "userPassword"] 
        let missingAdoAssets = []
        for(const name of reqParams){
            if (!this.fileObject.hasOwnProperty(name)) {
                missingAdoAssets.push(name);
            } else {
                let value = this.fileObject[name].trim();
                if (!value) missingAdoAssets.push(name);
            }
        }
        return missingAdoAssets
    }


    tryReadFile(): boolean {
        try {
            if (!fs.existsSync(this.filePath)) {
                this.logger.error(`${this.filePath} is missing`)
                return false;
            }
            let fileContent = fs.readFileSync(this.filePath, { encoding: 'utf8' });
            this.fileObject = JSON.parse(fileContent);
            return true;
        }
        catch {
            this.logger.error("Failed to read json")
            return false;
        }
    }


}