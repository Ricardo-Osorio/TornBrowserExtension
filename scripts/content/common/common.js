"use strict"

const minProfit = 50
const minPercentage = 25

// In-memory mapping of all items and their selling and market prices.
// Fetched from the Torn API once and then stored/retrieved from the browser.
// Selling prices don't change and market prices don't flutuate much
// for most items. This should still be updated periodically (TODO).
var pricesTable

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function requireElement(selector) {
    var attempt = 0
    while (attempt < 20) { // max 5 sec
        var element = document.querySelector(selector)
        if (element) return

        // console.log("[TMM] waiting for dom element to be present (250ms)")
        await sleep(250)
        attempt++
    }
    console.log("[TMM] waiting for dom element to be present has failed all attempts (5s)")
}

async function requireNotElement(selector) {
    var attempt = 0
    while (attempt < 20) { // max 5 sec
        var element = document.querySelector(selector)
        if (!element) return

        // console.log("[TMM] waiting for dom element to not be present (250ms)")
        await sleep(250)
        attempt++
    }
    console.log("[TMM] waiting for dom element to not be present has failed all attempts (5s)")
}

async function fetchItemsFromAPI () {
    console.log("[TMM] fetching item list from API")
    var url = "https://api.torn.com/torn/?selections=items&key=2rnP7yh9fXM5x0ru"
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

function storePricesTable(pricesTable) {
    // it's not possible to store a map directly
    // thus needs to be wrapped in an object
    browser.storage.local.set({map: pricesTable})
}

async function recoverPricesTableFromStorage() {
    return browser.storage.local.get()
}

async function getPricesTable() {
    // avoid fetching/retrieving the data if already done so
    if (pricesTable) return pricesTable

    pricesTable = await recoverPricesTableFromStorage()
    if (typeof pricesTable.map === 'undefined') {
        pricesTable = await fetchItemsFromAPI()
        if (!pricesTable) {
            console.log("[TMM] failed to fetch items, aborting")
            return
        }
        storePricesTable(pricesTable)
    } else {
        // console.log("[TMM] loaded from storage")
        pricesTable = pricesTable.map
    }
    return pricesTable
}