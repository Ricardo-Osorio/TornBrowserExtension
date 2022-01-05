"use strict"

showHighlight()
listenForNewRows()

async function listenForNewRows() {
    // wait for the dynamic list that loads all items
    await requireElement(".ReactVirtualized__Grid__innerScrollContainer")

    // no point doing this for each new row
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

    var list = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer")
    var config = { childList: true, subtree: true }
    var observer = new MutationObserver(callback)
    observer.observe(list, config)
    
    function callback(mutationsList) {
        for(const mutation of mutationsList) {
            if (mutation.removedNodes.length === 1 && mutation.removedNodes[0].classList.contains("item___CAjnz")) {
                // console.log("[TMM] item removed, updating highlights")

                // processes all items in the page
                showHighlight()
            } else if (mutation.addedNodes.length == 1 && mutation.addedNodes[0].classList.contains("row___nCKu7")) {
                // console.log("[TMM] handling new row of items")

                // rows are loaded as needed (scroll down the page) thus
                // need to be handled differently than processing the entire page.
                // doing so also reduces the amount of work that has to be done
                handleNewRowLoaded(pricesTable, mutation.addedNodes[0])
            }
        }
    }
}

async function handleNewRowLoaded(pricesTable, newRow) {
    for (var item of newRow.querySelectorAll(":scope > div .item___CAjnz.item___ZYlyz")) {
        var itemID = item.querySelector(":scope > div img").getAttribute("src") // "/images/items/378/large.png?v=1555232..."
        itemID = itemID.match(/\d+/)[0]

        var currentPrice = item.querySelector(":scope > div p ~ p").lastChild.data
        currentPrice = Number(currentPrice.replaceAll(',',''))

        var name = item.querySelector(":scope > div .imgBar___RwG9v").getAttribute("aria-label")
        console.log(`[TMM] processing item ${name} selling for ${currentPrice}`)

        // item fetched from Torn API
        var apiItem = pricesTable.get(itemID)
        var sellingPrice = apiItem.price
        if (!sellingPrice) return // a few items don't have one, I.G. "Pillow"

        if (sellingPrice - currentPrice > minProfit) {
            item.classList.add("tmm-highlight")

            var priceElement = item.querySelector(":scope > div .price___zTGNJ")
            priceElement.classList.add("tmm-flex-with-space")

            // create and add a profit element to the DOM
            const profitElement = document.createElement("span")
            profitElement.classList.add("positive")
			profitElement.appendChild(document.createTextNode(`+ $${sellingPrice - currentPrice}`))
			priceElement.appendChild(profitElement);
        }
    }
}

async function showHighlight() {
    // console.log("[TMM] highlight script started")
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

    // wait for the dynamic list that loads all items
    await requireElement(".ReactVirtualized__Grid__innerScrollContainer")

    for (var item of document.querySelectorAll(".item___CAjnz.item___ZYlyz")) {
        var itemID = item.querySelector(":scope > div img").getAttribute("src") // "/images/items/378/large.png?v=1555232..."
        itemID = itemID.match(/\d+/)[0]

        var currentPrice = item.querySelector(":scope .price___zTGNJ").textContent
        // when refreshing the highlights (sidebar button) the profit element we
        // add will be now included in this element thus why the need for split()
        currentPrice = Number(currentPrice.split("$")[1].replace(",",""))

        // item fetched from Torn API
        var apiItem = pricesTable.get(itemID)
        var sellingPrice = apiItem.price
        if (!sellingPrice) continue // a few items don't have one, I.G. "Pillow"

        if (sellingPrice - currentPrice > minProfit) {
            if (item.classList.contains("tmm-highlight")) {
                console.log("[TMM] update of element deemed not necessary")
                continue
            }
            item.classList.add("tmm-highlight")
            
            var priceElement = item.querySelector(":scope > div .price___zTGNJ")
            priceElement.classList.add("tmm-flex-with-space")

            // create a profit element
            const profitElement = document.createElement("span")
            profitElement.classList.add("positive")
			profitElement.appendChild(document.createTextNode(`+ $${sellingPrice - currentPrice}`))

			priceElement.appendChild(profitElement);
        }
    }

    console.log("[TMM] done")
}