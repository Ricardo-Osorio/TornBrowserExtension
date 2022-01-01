"use strict";

showHighlight()

async function showHighlight() {
    // avoiding running the script multiple times when unnecessary. Opening the
    // prices of an item will make a XMLHttpRequest which will then trigger this
    // function. Changing the categories also triggers this but without a reload
    // of the page. This makes it a bit tricky to handle due to the suggested
    // way of handing this kind of problem (window.hasRun for example) not being
    // viable
    var earlyExit = document.querySelector("[aria-expanded='true'] > * .tmm-highlight")
    if (earlyExit) {
        console.log("[TMM] return early")
        return
    }

    var pricesTable = await recoverPricesTableFromStorage()
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

    await requireElement(".item-market-wrap div[aria-expanded='true'] li[data-item]")

    for (var item of document.querySelectorAll(".item-market-wrap div[aria-expanded='true'] li[data-item]")) {
        var id = item.children[0].getAttribute("itemid")
        var price = parseFloat(item.children[0].getAttribute("aria-label").split(": $")[1].replaceAll(',',''))

        var sellingPrice = pricesTable.get(id)
        if (!sellingPrice) continue

        var profit = sellingPrice - price
        if (profit > 50) {
            var titleElement =item.querySelector(":scope > .title")
            if (titleElement.classList.contains("tmm-highlight")) {
                // console.log("[TMM] update of element deemed not necessary")
                continue
            }
            titleElement.classList.add("tmm-highlight")

            // add profit element
            titleElement.style="line-height:18px;"
            const profitElement = document.createElement("div")
            profitElement.appendChild(document.createTextNode("$"+profit))
            titleElement.appendChild(profitElement)
        }
    }

    console.log("[TMM] done")
}

async function requireElement(selector) {
    var attempt = 0
    while (attempt < 16) { // max 4 sec
        var element = document.querySelector(selector)
        if (element) return

        // console.log("[TMM] waiting for dom (250ms)")
        await sleep(250)
        attempt++
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchItemsFromAPI () {
    console.log("[TMM] fetching from API")
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