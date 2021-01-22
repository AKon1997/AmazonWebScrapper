import xlsx, { ParsingOptions, utils, WorkSheet, XLSX$Consts } from 'xlsx';
import fs from 'fs';
import path from 'path';



export default class ExcelReaderWriter {
    protected filePath: string;
    protected wb: xlsx.WorkBook
    static readonly HEADER_COLOR = "ffff00";
    static readonly HEADER = ['A', 'B', 'C'];

    constructor(filePath: string) {
        this.filePath = filePath
    }


    readFileToWB() {
        this.wb = xlsx.readFile(this.filePath)
        return this.wb
    }


    readDataToArray(sheetName : string) {
        let data = xlsx.utils.sheet_to_json(this.wb.Sheets[sheetName], {
            'blankrows': false,
            'defval': '',
            'header': 1,
            'raw': false,
            'rawNumbers': false
        })
        return data
    }


    writeData(name: string, data: any) {
        this.readFileToWB()
        let ws = xlsx.utils.json_to_sheet(data)
        ws['!cols'] = [{ wpx: 200 },{ wpx: 150 },{ wpx: 200 }]
        xlsx.utils.book_append_sheet(this.wb, ws, name)
        xlsx.writeFile(this.wb, this.filePath, { bookType: 'xlsx' });
    }

    deleteBaseSheet(name : string = "Sheet1"){
        let sheets = this.wb.SheetNames
        let wb = xlsx.utils.book_new()
        for(const sheet of sheets){
            if(sheet != name) xlsx.utils.book_append_sheet(wb, this.wb.Sheets[sheet], sheet)
        }
        xlsx.writeFile(wb, this.filePath, { bookType: 'xlsx' })
    }


}