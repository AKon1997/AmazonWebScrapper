import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';


export default class ExcelValidation{


    static isFileExists(filePath : string) : boolean {
        return fs.existsSync(filePath)
    }

    static isSheetPresent(sheetName : string,wb : xlsx.WorkBook) :boolean{
        let sheets = wb.SheetNames
        if(sheets.includes(sheetName)) return true
        return false
    }

    static isHeaderRowPresent(data : any, requiredHeaders : string[]) : number{
        for(let i = 0; i < data.length; i ++){
            let currentRow = data[i].filter((el:any) => requiredHeaders.includes(el.trim()))
            if(currentRow.length > 0) return i
        }
        return -1
    }

    static isDuplicateColumnsPresent(data : any, index : number, headers : string[]) : boolean{
        let duplicatesArr = data[index].filter((el:any) => el != "").filter((el:any, index : number, arr : string[]) => arr.indexOf(el) != index && headers.includes(el.trim()))
        if(duplicatesArr.length > 0) return true
        return false
    }


}