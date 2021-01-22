import puppeteer, { Page, ElementHandle } from 'puppeteer'
import util from 'util'
import { ResultRow } from '../../utils/ResultRow'

export class SearchPage {
    protected page: Page


    protected readonly SORT_BY_ID: string = "#s-result-sort-select"
    protected readonly SORT_OPTIONS_SELECTOR: string = "#a-popover-4"
    protected readonly NAVIGATION_MENU: string = ".a-pagination"
    protected readonly NEXT_PAGE_BUTTON : string = ".a-selected + li.a-normal a"
    protected readonly PRODUCT_TEXT_SELECTORS : string = '.a-size-base.a-link-normal:not(.a-text-bold)'
    protected readonly PRODUCT_PRICE : string = '.a-price:not(.a-text-price) .a-offscreen'
    protected readonly LOGO_ID : string = "#nav-logo-sprites"
    protected readonly SEARCH_TOOLBAR_ID : string = "#twotabsearchtextbox"


    constructor(page: Page) {
        this.page = page
    }


    async setPageFilter(sortedBy: string) {
        await this.page.click(this.SORT_BY_ID)
        await this.page.waitForSelector(this.SORT_OPTIONS_SELECTOR, { visible: true })
        let values = await this.page.$$(this.SORT_OPTIONS_SELECTOR + " a")
        for await (const value of values) {
            let text = await this.page.evaluate(value => value.innerText, value)
            if (text == sortedBy) {
                await this.page.evaluate(value => value.click(), value)
                await this.page.waitForSelector(this.NAVIGATION_MENU)
                return
            }
        }
        console.log(util.format("No filter with name %s found. Left the default one", sortedBy))
    }

    async collectProducts(count: number): Promise<ResultRow[]> {
        let results: ResultRow[] = []
        while (true) {
            let prices = await this.page.$$(this.PRODUCT_TEXT_SELECTORS)
            console.log("Price collected")
            for (const price of prices){            
                if( !(await this.page.evaluate(price => price.textContent, price)).includes("$")) continue
                let result : ResultRow = new ResultRow()
                result.Url= await this.page.evaluate(price => price.href, price)
                result.Price = await price.$eval(this.PRODUCT_PRICE, el => el.textContent)
                results.push(result)
                if(results.length == count) {
                    return results}
            }
            let nextPage =  await this.page.$(this.NEXT_PAGE_BUTTON)
            if(nextPage == undefined) {
                return results
            }
            await this.page.evaluate(link => link.click(), nextPage)
             await this.page.waitForSelector(this.NAVIGATION_MENU)
            console.log()
        }
    }

    async returnToMainPage(){
        await this.page.click(this.LOGO_ID)
        await this.page.waitForSelector(this.SEARCH_TOOLBAR_ID)
    }


}