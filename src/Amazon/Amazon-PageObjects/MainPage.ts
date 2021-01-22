import puppeteer, {Page} from 'puppeteer'


export class MainPage{
    protected readonly DELIVER_TO_ID : string = "#nav-global-location-popover-link"
    protected readonly SELECT_COUNTRY_ID : string = ".a-native-dropdown"
    protected readonly BUTTON_DONE_SELECTOR : string = ".a-popover-footer button"

    protected readonly INPUT_SEARCH_ID : string = "#twotabsearchtextbox"
    protected readonly SEARCH_BUTTTON_ID : string = "#nav-search-submit-button"
    protected readonly SEARCH_CONTAINER_ID : string = "#search #s-result-sort-select"

    protected page : Page

    constructor(page : Page){
        this.page = page
    }

    async selectCountryToDeliver(countryName : string){
        console.log()
        //await this.page.waitForNavigation()
        await this.page.click(this.DELIVER_TO_ID)
        await this.page.waitForSelector(this.SELECT_COUNTRY_ID , {visible : true})
        await this.page.select(this.SELECT_COUNTRY_ID , countryName)
        await this.page.click(this.BUTTON_DONE_SELECTOR)
        await this.page.waitForNavigation()
    }

    async enterProductName(productName : string){
        await this.page.$eval(this.INPUT_SEARCH_ID, input => input.nodeValue = "")
        await this.page.type(this.INPUT_SEARCH_ID, productName)
        await this.page.click(this.SEARCH_BUTTTON_ID)
        await this.page.waitForNavigation()
        await this.page.waitForSelector(this.SEARCH_CONTAINER_ID)
    }

}