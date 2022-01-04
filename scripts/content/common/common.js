"use strict"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function requireElement(selector) {
    var attempt = 0
    while (attempt < 20) { // max 4 sec
        var element = document.querySelector(selector)
        if (element) return

        console.log("[TMM] waiting for dom element to be present (250ms)")
        await sleep(250)
        attempt++
    }
    console.log("[TMM] waiting for dom element to be present has failed all attempts (5s)")
}

async function requireNotElement(selector) {
    var attempt = 0
    while (attempt < 20) { // max 4 sec
        var element = document.querySelector(selector)
        if (!element) return

        console.log("[TMM] waiting for dom element to not be present (250ms)")
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
