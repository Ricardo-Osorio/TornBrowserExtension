"use strict"

// Minimum amount of profit necessary to show the highlight and value you would
// get from buying and then reselling that item
const defaultMinProfit = 450
// TODO
const defaultMinProfitResell = 200
// Minimum percentage necessary to show the discount element over an item
const defaultMinPercentage = 25
// Minimum value of an item necessary to consider showing the piggy bank icon
const defaultMinPiggyBankValue = 20000
// Maximum amount you're willing to overpay for an item when doing so with the
// goal of storing money away
const defaultMaxPiggyBankExpense = 450
// number of miliseconds in a minute
const msInMinute = 60000

const regexListingsPage = new RegExp("^https:\/\/www\.torn\.com\/imarket\.php#\/p=your.*")
const regexMarketPage = new RegExp("^https:\/\/www\.torn\.com\/imarket\.php#\/p=market.*")

// Market category names on the market sidepanel don't exactly match the ones from the
// api. This map helps with that, mapping the UI name into what to expect from the API
// const categoriesMap = new Map(
//     ["medical-items", "Medical"],
//     ["temporary-items", "Temporary"],
//     ["energy-drinks", "Energy Drink"],
//     ["candy", "Drug"],
//     ["enhancers", "Enhancer"],
//     ["alcohol", "Alcohol"],
//     ["flowers", "Flower"],
//     ["clothing", "Clothing"],
//     ["plushies", "Plushie"],
//     ["special-items", "Special"],
// )

// In-memory mapping of all items and their selling and market prices.
// Fetched from the Torn API once and then stored/retrieved from the browser.
// Selling prices don't change and market prices don't flutuate much
// for most items. This should still be updated periodically (TODO).
var pricesTable

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Builds the URL to fetch the icons. Supports as input:
// candy, car, market, refresh, rifle, tools and piggy-bank
function getIconURL(name) {
    return browser.extension.getURL("resources/icons/"+name+"-icon.png");  
}

async function requireElement(selector, maxRetries) {
    var attempt = 0
    while (attempt < maxRetries) { // 20 attempts = 5 sec
        var element = document.querySelector(selector)
        if (element) return

        // console.log("[TM+] waiting for dom element to be present (250ms)")
        await sleep(250)
        attempt++
    }
    console.log("[TM+] waiting for dom element to be present has failed all attempts (5s)")
}

async function requireNotElement(selector) {
    var attempt = 0
    while (attempt < 20) { // max 5 sec
        var element = document.querySelector(selector)
        if (!element) return

        // console.log("[TM+] waiting for dom element to not be present (250ms)")
        await sleep(250)
        attempt++
    }
    console.log("[TM+] waiting for dom element to not be present has failed all attempts (5s)")
}

async function fetchItemsFromAPI () {
    console.log("[TM+] fetching item list from API")

    var storedObj = await browser.storage.local.get("apiKey")
    if (!storedObj.apiKey) console.log("[TM+] api key not found")
    // TODO handle case where this is not found

    var url = "https://api.torn.com/torn/?selections=items&key="+storedObj.apiKey
    let response = await fetch(url)
    let data = await response.json()
    if (!data.items) return

    let pricesTable = new Map()

    // extract a map[item ID] -> {selling price, market price}
    Object.keys(data.items).forEach((key, index) => {
        pricesTable.set(
            key, 
            {
                price: data.items[key].sell_price,
                marketPrice: data.items[key].market_value
            }
        )
    })
    return pricesTable
}

async function getPricesTable() {
    // avoid fetching/retrieving the data if already done so
    if (pricesTable) return pricesTable

    var storedObj = await browser.storage.local.get("pricesTable")
    if (!storedObj.pricesTable) {
        pricesTable = await fetchItemsFromAPI()
        if (typeof pricesTable === 'undefined') {
            console.log("[TM+] failed to fetch items, aborting")
            return
        }
        browser.storage.local.set({pricesTable})
    } else {
        pricesTable = storedObj.pricesTable
    }
    return pricesTable
}

async function getMinProfit() {
    var value
    await browser.storage.local.get([
        "minProfit",
    ]).then(values => {
        value = (values.minProfit) ? values.minProfit : defaultMinProfit
    })
    return value
}

async function getMinPercentage() {
    var value
    await browser.storage.local.get([
        "minPercentage",
    ]).then(values => {
        value = (values.minPercentage) ? values.minPercentage : defaultMinPercentage
    })
    return value
}

async function getMinPiggyBankValue() {
    var value
    await browser.storage.local.get([
        "minPiggyBankValue",
    ]).then(values => {
        value = (values.minPiggyBankValue) ? values.minPiggyBankValue : defaultMinPiggyBankValue
    })
    return value
}

async function getMaxPiggyBankExpense() {
    var value
    await browser.storage.local.get([
        "maxPiggyBankExpense",
    ]).then(values => {
        value = (values.maxPiggyBankExpense) ? values.maxPiggyBankExpense : defaultMaxPiggyBankExpense
    })
    return value
}

function Mutex() {
    let current = Promise.resolve()
    this.lock = () => {
        let _resolve
        const p = new Promise(resolve => {
            _resolve = () => resolve()
        })
        // Caller gets a promise that resolves when the current outstanding
        // lock resolves
        const rv = current.then(() => _resolve)
        // Don't allow the next request until the new promise is done
        current = p
        // Return the new promise
        return rv
    }
}

// ensures the script runs one at a time. The background script can fire
// multiple simulataneos instances of the content scripts
const listingsScriptMutex = new Mutex();
const marketScriptMutex = new Mutex();