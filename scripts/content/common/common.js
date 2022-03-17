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
// number of milliseconds in a minute
const msInMinute = 60000

const regexListingsPage = new RegExp("^https:\/\/www\.torn\.com\/imarket\.php#\/p=your.*")
const regexMarketPage = new RegExp("^https:\/\/www\.torn\.com\/imarket\.php#\/p=market.*")

// Market category names on the market side panel don't exactly match the ones from the
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
// Selling prices don't change and market prices don't fluctuate much
// for most items..
var pricesTable

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Builds the URL to fetch the icons. Supports as input:
// candy, car, market, refresh, rifle, tools and piggy-bank
function getIconURL(name) {
    return chrome.extension.getURL("resources/icons/"+name+"-icon.png");  
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

function get(key) {
    return new Promise(async (resolve) => {
        const data = await new Promise((resolve) => chrome.storage.local.get([key], (data) => resolve(data)))
        resolve(data[key])
    })
}

function set(object) {
    return new Promise((resolve) => chrome.storage.local.set(object, () => resolve()))
}

async function fetchItemsFromAPI () {
    console.log("[TM+] fetching item list from API")

    var apiKey = await get("apiKey")
    if (!apiKey) console.log("[TM+] api key not found")
    // TODO handle case where this is not found

    var url = "https://api.torn.com/torn/?selections=items&key="+apiKey
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

    console.log("[TM+] API request successful")
    return pricesTable
}

async function getPricesTable() {
    // avoid fetching/retrieving the data if already done so
    if (pricesTable && Object.keys(pricesTable).length !== 0) return pricesTable

    console.log("[TM+] prices table NOT found in-memory")

    var pricesTable = await get("pricesTable")
    if (!pricesTable || Object.keys(pricesTable).length === 0) {
        pricesTable = await fetchItemsFromAPI()
        if (typeof pricesTable === 'undefined') {
            console.log("[TM+] failed to fetch items, aborting")
            return
        }
        await set({pricesTable})
    } else {
        pricesTable = pricesTable
    }
    return pricesTable
}

async function getMinProfit() {
    var value = await get("minProfit")
    return (value) ? value : defaultMinProfit
}

async function getMinPercentage() {
    var value = await get("minPercentage")
    return (value) ? value : defaultMinPercentage
}

async function getMinPiggyBankValue() {
    var value = await get("minPiggyBankValue")
    return (value) ? value : defaultMinPiggyBankValue
}

async function getMaxPiggyBankExpense() {
    var value = await get("maxPiggyBankExpense")
    return (value) ? value : defaultMaxPiggyBankExpense
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
// multiple simultaneous instances of the content scripts
const listingsScriptMutex = new Mutex();
const marketScriptMutex = new Mutex();