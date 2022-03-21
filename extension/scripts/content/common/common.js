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

let injectedXHR

injectXHR()

function injectXHR() {
	if (injectedXHR) return;

    // create script
    let scr = document.createElement("script")
    scr.setAttribute("type", "text/javascript")
    scr.setAttribute("src", chrome.runtime.getURL("scripts/content/common/xhr-intercept.js"))

    // inject into document
	document.body.appendChild(scr)

	injectedXHR = true
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Builds the URL to fetch the icons. Supports as input:
// candy, car, market, refresh, rifle, tools and piggy-bank
function getIconURL(name) {
    return chrome.runtime.getURL("resources/icons/"+name+"-icon.png")
}

async function requireElement(selector, maxRetries) {
    let attempt = 0
    while (attempt < maxRetries) { // 20 attempts = 5 sec
        let element = document.querySelector(selector)
        if (element) return

        // console.log("[TM+] waiting for dom element to be present (250ms)")
        await sleep(250)
        attempt++
    }
    console.log("[TM+] waiting for dom element to be present has failed all attempts (5s)")
}

async function requireNotElement(selector) {
    let attempt = 0
    while (attempt < 20) { // max 5 sec
        let element = document.querySelector(selector)
        if (!element) return

        // console.log("[TM+] waiting for dom element to not be present (250ms)")
        await sleep(250)
        attempt++
    }
    console.log("[TM+] waiting for dom element to not be present has failed all attempts (5s)")
}

function get(key) {
    // Immediately return a promise and start asynchronous work
    return new Promise((resolve) => {
        // Asynchronously call
        chrome.storage.local.get(key, (items) => {
            resolve(items[key])
        })
    })
}

function set(object) {
    return new Promise((resolve) => chrome.storage.local.set(object, () => resolve()))
}

async function fetchItemsFromAPI () {
    console.log("[TM+] fetching item list from API")

    let apiKey = await get("apiKey")
    if (!apiKey) {
        console.log("[TM+] api key not found")
        return
    }

    let url = "https://api.torn.com/torn/?selections=items&key="+apiKey
    let response = await fetch(url)
    let data = await response.json()
    if (!data.items) return

    let pricesTable = new Map()

    let count = 0
    // extract a map[item ID] -> {selling price, market price}
    Object.keys(data.items).forEach((key, index) => {
        pricesTable.set(
            key, 
            {
                price: data.items[key].sell_price,
                marketPrice: data.items[key].market_value
            }
        )
        count++
    })

    console.log(`[TM+] API request successful, got ${count} items`)
    return pricesTable
}

async function getPricesTable() {
    let pricesTableObj = await get("pricesTableObj")
    if (typeof pricesTableObj !== 'undefined') {
        let pricesTable = new Map(Object.entries(pricesTableObj))
        if (pricesTable.size !== 0) {
            console.log("[TM+] prices table fetched from storage. Size: " + pricesTable.size)
            return pricesTable
        }
    }
    
    // background script failed to get data or didn't run in time?

    let pricesTable = await fetchItemsFromAPI()
    if (typeof pricesTable === 'undefined' || pricesTable.size === 0) {
        console.log("[TM+] failed to fetch items, aborting")
        return
    }

    pricesTableObj = Object.fromEntries(pricesTable)
    set(pricesTableObj)
    return pricesTable
}

async function getMinProfit() {
    let value = await get("minProfit")
    return (value) ? value : defaultMinProfit
}

async function getMinPercentage() {
    let value = await get("minPercentage")
    return (value) ? value : defaultMinPercentage
}

async function getMinPiggyBankValue() {
    let value = await get("minPiggyBankValue")
    return (value) ? value : defaultMinPiggyBankValue
}

async function getMaxPiggyBankExpense() {
    let value = await get("maxPiggyBankExpense")
    return (value) ? value : defaultMaxPiggyBankExpense
}