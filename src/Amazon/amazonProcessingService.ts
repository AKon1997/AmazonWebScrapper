import { InputRow } from "../utils/InputRow";
import { ResultRow } from "../utils/ResultRow";
import puppeteer, {Browser,Page} from 'puppeteer'
import { App } from "../App";
import util from 'util'
import { SearchPage } from "./Amazon-PageObjects/SearchPage";
import { MainPage } from "./Amazon-PageObjects/MainPage";
import { createModuleResolutionCache } from "typescript";


export enum ServiceResult{

}

export class AmazonProcessingService{

    protected readonly AMAZON_URL : string = "https://www.amazon.com/"
    
    protected rowsToProcess : InputRow[]
    protected results : {
        [key : string] : ResultRow[]
    } | {}
    protected browser : Browser
    protected page : Page


    constructor(rowsToProcess: InputRow[]){
        this.rowsToProcess = rowsToProcess
        this.results = {}
    }

    async runService(){
        if(!await this.launchBrowser()) return
        await this.processRows()

    }

    getServiceResult() :  { [key : string] : ResultRow[] }{
        return this.results
    }

    protected async launchBrowser() : Promise<boolean>{
        try{
            console.log("Navigating to Amazon.com")
            this.browser = await puppeteer.launch({ headless : false,})
            
            this.page = (await this.browser.pages())[0]
            await this.page.setViewport({ width: 1280, height: 800 });
            await this.page.goto(this.AMAZON_URL)
            return true
        }
        catch(e){
            console.log(util.format("Unable to launch browsr due to %s. Terminating the process ",e.message))
            return false
        }
    }

    protected async processRows() : Promise<boolean>{
        
        for(const row of this.rowsToProcess){
            if(!row.Product || row.Product.length == 0){
                console.log("Row is invalid - no product to search. Moving to next one")
                continue
            }

            if(this.results.hasOwnProperty(row.Product)){
                console.log("Duplicate row found. Moving to next one")
                continue
            }
            if(!row.SortedBy || row.SortedBy.length == 0 || !row.Count || row.Count.length ==0 ){
                console.log("Row is missing mandatory information to search. Moving to next one")
                continue
            }
            let mainPage = new MainPage(this.page)
            await mainPage.enterProductName(row.Product)
            let searchPage = new SearchPage(this.page)
            let result = await searchPage.collectProducts(Number(row.Count))
            this.results[row.Product] = result
            await searchPage.returnToMainPage()
            console.log(util.format("Product %s was processed", row.Product))
        }

        return true
    }
}