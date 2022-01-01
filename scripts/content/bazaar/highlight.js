"use strict"

// test with this bazaar
// https://www.torn.com/bazaar.php?userId=322162

showHighlight()
listenForNewRows()

async function listenForNewRows() {
    // dynamic list is present
    await requireElement(".ReactVirtualized__Grid__innerScrollContainer")

    // no point doing this for each new row
    var pricesTable = await recoverPricesTableFromStorage()
    if (typeof pricesTable.map === 'undefined') {
        pricesTable = await fetchItemsFromAPI()
        if (!pricesTable) {
            console.log("[TMM] failed to fetch items, stopping")
            return
        }
        storePricesTable(pricesTable)
    } else {
        pricesTable = pricesTable.map
    }

    var list = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer")
    var config = { childList: true }
    var observer = new MutationObserver(callback)
    observer.observe(list, config)
    
    function callback(mutationsList) {
        for(const mutation of mutationsList) {
            // rows are loaded as needed
            mutation.addedNodes.forEach(function(newRow){
                handleIndividualItemLoaded(pricesTable, newRow)
            })
        }
    }
}

async function handleIndividualItemLoaded(pricesTable, newRow) {
    for (var item of newRow.querySelectorAll(":scope > div .item___CAjnz.item___ZYlyz")) {
        // var name = item.querySelector(":scope > div .imgBar___RwG9v").getAttribute("aria-label")
        // console.log("[TMM] processing item " + name)
        
        var id = item.querySelector(":scope > div img").getAttribute("src") // "/images/items/378/large.png?v=1555232..."
        id = id.match(/\d+/)[0]

        var price = item.querySelector(":scope > div p ~ p").lastChild.data
        price = Number(price.replaceAll(',',''))

        var sellingPrice = pricesTable.get(id)
        if (!sellingPrice) continue

        var profit = sellingPrice - price
        if (profit > 1) { // increase profit as desired, keeping it 1 for debugging
            item.classList.add("tmm-highlight")

            var priceElement = item.querySelector(":scope > div .price___zTGNJ")
            priceElement.classList.add("tmm-flex-with-space")

            const profitElement = document.createElement("span")
            profitElement.classList.add("positive")
			profitElement.appendChild(document.createTextNode("$"+profit))
			priceElement.appendChild(profitElement);
        }
    }
}

async function showHighlight() {
    var pricesTable = await recoverPricesTableFromStorage()
    if (typeof pricesTable.map === 'undefined') {
        pricesTable = await fetchItemsFromAPI()
        if (!pricesTable) {
            console.log("[TMM] failed to fetch items, stopping")
            return
        }
        storePricesTable(pricesTable)
    } else {
        pricesTable = pricesTable.map
    }

    // dynamic list is present
    await requireElement(".ReactVirtualized__Grid__innerScrollContainer")

    for (var item of document.querySelectorAll(".item___CAjnz.item___ZYlyz")) {
        var id = item.querySelector(":scope > div img").getAttribute("src") // "/images/items/378/large.png?v=1555232..."
        id = id.match(/\d+/)[0]

        var price = item.querySelector(":scope .price___zTGNJ").textContent
        // when refreshing the highlights (sidebar button) the profit will be
        // now included in this element thus why the need for split()
        price = Number(price.split("$")[1].replace(",",""))

        var sellingPrice = pricesTable.get(id)
        if (!sellingPrice) continue

        var profit = sellingPrice - price
        if (profit > 50) {
            if (item.classList.contains("tmm-highlight")) {
                // console.log("[TMM] update of element deemed not necessary")
                continue
            }
            item.classList.add("tmm-highlight")
            
            var priceElement = item.querySelector(":scope > div .price___zTGNJ")
            priceElement.classList.add("tmm-flex-with-space")

            // add profit element
            const profitElement = document.createElement("span")
            profitElement.classList.add("positive")
			profitElement.appendChild(document.createTextNode("$"+profit))
			priceElement.appendChild(profitElement);
        }
    }

    console.log("[TMM] done")
}

async function requireElement(selector) {
    var attempt = 0
    while (attempt < 16) { // max 4 sec
        var element = document.querySelector(selector)
        if (element) return

        console.log("[TMM] waiting for dom (250ms)")
        await sleep(250)
        attempt++
    }
    console.log("[TMM] waiting for dom failed all attempts (4s)")
}

async function requireNotElement(selector) {
    var attempt = 0
    while (attempt < 16) { // max 4 sec
        var element = document.querySelector(selector)
        if (!element) return

        console.log("[TMM] waiting for dom to not be there (250ms)")
        await sleep(250)
        attempt++
    }
    console.log("[TMM] waiting for dom to not be there failed (4s)")
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