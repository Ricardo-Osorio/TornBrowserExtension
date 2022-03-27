"use strict"

// Minimum profit from reselling the item on the NPC stores to show highlights
const defaultMinProfit = 450
// Minimum profit from reselling the item on the market to show highlights 
const defaultMinProfitResell = 200
// Minimum percentage to show the sale icon over an item
const defaultMinPercentage = 25
// Minimum value of an item necessary to consider showing the piggy bank icon
const defaultMinPiggyBankValue = 20000
// Maximum amount you're willing to overpay for an item when storing away money
const defaultMaxPiggyBankExpense = 450

injectXHR()

function injectXHR() {
	let found = document.querySelector("script[src$='intercept/xhr-requests.js']")
    if (found) {
        console.log("[TM+] prevented injecting script twice")
        return
    }

    // create script
    let scr = document.createElement("script")
    scr.setAttribute("type", "text/javascript")
    scr.setAttribute("src", chrome.runtime.getURL("scripts/content/intercept/xhr-requests.js"))

    // inject script into document
	document.body.appendChild(scr)
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
                marketPrice: data.items[key].market_value,
                category: data.items[key].type
            }
        )
        count++
    })

    console.log(`[TM+] API request successful, got ${count} items`)
    return pricesTable
}

async function getCategorySettings() {
    let categorySettingsObj = await get("categorySettingsObj")
    if (typeof categorySettingsObj !== 'undefined') {
        let categorySettings = new Map(Object.entries(categorySettingsObj))
        if (categorySettings.size !== 0) {
            return categorySettings
        }
    }

    // default values
    let categorySettings = new Map()
    categorySettings.set("Melee", {shop: true, market: false, sale: false})
    categorySettings.set("Primary", {shop: true, market: false, sale: false})
    categorySettings.set("Secondary", {shop: true, market: false, sale: false})
    categorySettings.set("Defensive", {shop: true, market: false, sale: false})
    categorySettings.set("Medical", {shop: true, market: true, sale: false})
    categorySettings.set("Temporary", {shop: true, market: false, sale: false})
    categorySettings.set("Energy Drink", {shop: true, market: true, sale: false})
    categorySettings.set("Candy", {shop: true, market: true, sale: false})
    categorySettings.set("Drug", {shop: true, market: true, sale: false})
    categorySettings.set("Enhancer", {shop: true, market: false, sale: false})
    categorySettings.set("Alcohol", {shop: true, market: true, sale: false})
    categorySettings.set("Booster", {shop: true, market: false, sale: false})
    categorySettings.set("Electronic", {shop: true, market: false, sale: false})
    categorySettings.set("Jewelry", {shop: true, market: false, sale: false})
    categorySettings.set("Virus", {shop: true, market: false, sale: false})
    categorySettings.set("Flower", {shop: true, market: true, sale: false})
    categorySettings.set("Supply Pack", {shop: true, market: false, sale: false})
    categorySettings.set("Collectible", {shop: true, market: false, sale: false})
    categorySettings.set("Clothing", {shop: true, market: false, sale: false})
    categorySettings.set("Car", {shop: true, market: false, sale: false})
    categorySettings.set("Artifact", {shop: true, market: false, sale: false})
    categorySettings.set("Plushie", {shop: true, market: true, sale: false})
    categorySettings.set("Special", {shop: true, market: false, sale: false})
    categorySettings.set("Other", {shop: true, market: false, sale: false})
    return categorySettings
}

async function getPricesTable() {
    let pricesTableObj = await get("pricesTableObj")
    if (typeof pricesTableObj !== 'undefined') {
        let pricesTable = new Map(Object.entries(pricesTableObj))
        if (pricesTable.size !== 0) {
            // console.log("[TM+] prices table fetched from storage. Size: " + pricesTable.size)
            return pricesTable
        }
    }
    
    // background script failed to get data or didn't run in time
    // so we get it ourselves

    let pricesTable = await fetchItemsFromAPI()
    if (typeof pricesTable === 'undefined' || pricesTable.size === 0) {
        console.log("[TM+] failed to fetch items, aborting")
        return
    }

    pricesTableObj = Object.fromEntries(pricesTable)
    set({pricesTableObj})
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