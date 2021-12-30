"use strict"

async function showHighlight() {
    // div[aria-expanded=true]

    await requireElement(".item-market-wrap div[aria-expanded='true'] li[data-item]")

    var pricesTable = await recoverPricesTableFromStorage()
    if (!pricesTable) {
        pricesTable = await fetchItemsFromAPI()
        if (!pricesTable) {
            console.log("[DEBUG] failed to fetch items, stopping")
            return
        }
        storePricesTable(pricesTable)
    } else {
        // console.log("[DEBUG] loaded from storage")
        pricesTable = pricesTable.map
    }

    for (var item of document.querySelectorAll(".item-market-wrap div[aria-expanded='true'] li[data-item]")) {
        // console.log("[DEBUG] processing entry:", item)
        // var name = item.children[0].getAttribute("aria-label").split(": $")[0]
        var id = item.children[0].getAttribute("itemid")
        var price = parseFloat(item.children[0].getAttribute("aria-label").split(": $")[1].replaceAll(',',''))

        var sellingPrice = pricesTable.get(id)
        if (!sellingPrice) continue

        var profit = sellingPrice - price
        if (profit > 1) { // increase profit as desired, keeping it 1 for debugging
            if (item.classList.contains("tmm-highlight-item")) {
                console.log("[DEBUG] update of element deemed not necessary")
                continue
            }
            
            // TODO needs fixing and prob move elsewhere as well
            // var stop = document.querySelector("div[aria-expanded=true] .tmm-highlight-item")
            // if (stop) {
            //     // there are cases where:
            //     // - multiple sources trigger this script (loading page plus XMLHttpRequests)
            //     // - page does not update items list after seeing no updates to prices
            //     console.log("[DEBUG] update deemed not necessary")
            //     return
            // }

            item.classList.add("tmm-highlight-item")

            const profitElement = document.createElement("div")
            const text = document.createTextNode("$"+profit)
            profitElement.appendChild(text)
            item.children[1].children[0].appendChild(profitElement)
            // TODO try replaceChild or replaceChildren?
            // so in a way its, 1)clear div 2)set its contents
        }
    }

    console.log("[DEBUG] done")
}

async function requireElement(selector) {
    var attempt = 0
    while (attempt < 16) { // max 4 sec
        var element = document.querySelector(selector)
        if (element) return

        // console.log("[DEBUG] waiting for dom (250ms)")
        await sleep(250)
        attempt++
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchItemsFromAPI () {
    console.log("[DEBUG] fetching from API")
    var url = "https://api.torn.com/torn/?selections=items&key=2rnP7yh9fXM5x0ru"
    let response = await fetch(url)
    let data = await response.json()

    // store selling prices
    let pricesTable = new Map()

    // extract a map[ID] -> selling price
    var test = Object.keys(data.items)
    test.forEach((key, index) => {
        if (data.items[key].sell_price !== 0) {
            pricesTable.set(key, data.items[key].sell_price)
        }
    })
    return pricesTable
}

async function recoverPricesTableFromStorage() {
    return browser.storage.local.get()
}

function storePricesTable(pricesTable) {
    var pricesToStore = {
        map: pricesTable,
        // timestamp ?
    }
    browser.storage.local.set(pricesToStore)
}

showHighlight()

// TODO:
// Pressing an item in the market will copy its name into the search bar and because I currently
// have the price inside the name element the price will also be copies over