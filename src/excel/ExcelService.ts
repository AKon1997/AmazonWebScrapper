
import ExcelReaderWriter from "./ExcelReaderWriter";
import ExcelValidation from "./ExcelValidation";
import path from 'path'
import fs from 'fs'
import xlsx from 'xlsx'

import { App } from "../App";
import Logger from "../logger/Logger";
import { InputRow } from "../utils/InputRow";
import { ResultRow } from "../utils/ResultRow";



export default class ExcelService {

    protected excelReaderWriter: ExcelReaderWriter;
    protected excelValidation: ExcelValidation;
    protected logger = Logger.instance(__filename);

    protected filePath: string;
    protected sheetName: string;
    protected failureReason: string;
    protected requiredColumns: string[];



    getFailureReason(): string {
        return this.failureReason
    }

    constructor(filePath: string,  sheetName?: string, columns?: string) {
        this.excelReaderWriter = new ExcelReaderWriter(filePath);
        this.filePath = filePath
        if (sheetName) this.sheetName = sheetName
        if (columns) this.requiredColumns = columns.split(",")
    }



    public async inputValidation(): Promise<InputRow[]> {
        try {
            let wb: xlsx.WorkBook;

            //read file
            try {
                wb = this.excelReaderWriter.readFileToWB()
                if (wb.Workbook === undefined) {
                    this.failureReason = "file is broken"
                    return []
                }
            }
            catch (e) {
                if (e.message === 'File is password-protected') {
                    this.failureReason = "file is password protected"
                } else {
                    await this.logger.error(e.message)
                    this.failureReason = "file is broken"
                }
                return []
            }

            //search sheet
            if (!ExcelValidation.isSheetPresent(this.sheetName, wb)) {
                this.failureReason = "required sheet not found"
                return []
            }

            //read data
            let data = this.excelReaderWriter.readDataToArray(this.sheetName)
            //is sheet empty
            if (data.length == 0) {
                this.failureReason = "sheet is empty"
                return []
            }

            //is header row present
            let headerRowIndex = ExcelValidation.isHeaderRowPresent(data, this.requiredColumns)
            if (headerRowIndex == -1) {
                this.failureReason = "file does not contain header row"
                return []
            }
            //is dublicate header present
            if (ExcelValidation.isDuplicateColumnsPresent(data, headerRowIndex, this.requiredColumns)) {
                this.failureReason = "file contains duplicate headers"
                return []
            }
            //is data after header present
            let resultData: InputRow[] = this.getResult(data, headerRowIndex, this.requiredColumns)
            if (resultData.length == 0) {
                this.failureReason = "no data after header row"
            }


            return resultData
        }
        catch (e) {
            this.logger.error(e.message)
            this.failureReason = "unexpected issues with excel file"
            return []

        }
    }

    protected getResult(data: any, headerRowIndex: number, requiredColumns: string[]): InputRow[] {
        let indexMappingName : any = {
            "Product" : -1,
            "Count" : -1, 
            "Sorted By" : -1
        }

        data[headerRowIndex].forEach((el: any, index: number) => { 
            if (requiredColumns.includes(el.trim())) indexMappingName[el.trim()] =index 
        })

        let result : InputRow[] = []
        for (let i = headerRowIndex + 1; i < data.length; i++) {
            let row  : InputRow = new InputRow()
            let temp : any = {}
            for(const column in indexMappingName){
                temp[column.replace(" ", "")] = data[i][indexMappingName[column]].trim()
            } 
            Object.assign(row,temp)
            result.push(row)
        }
        return result
    }

    public async writeOutputFile(sheetName : string, data:ResultRow[]) {
        this.logger.info("Start creating output report")
        this.excelReaderWriter.writeData(sheetName,data)
        this.logger.info("Finish creating output report")
    }

    public deleteSheet(sheetName : string = "Sheet1"){
        this.excelReaderWriter.deleteBaseSheet()
    }
}