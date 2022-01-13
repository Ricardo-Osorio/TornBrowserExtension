"use strict"

showHighlight()
listenForChanges()

async function showHighlight() {
    // console.log("[TMM] highlight script started")

    var pricesTable = await getPricesTable()

    // bazaars consist of a dynamic list that loads new items as needed (scroll)
    // wait for that list to be present
    await requireElement(".ReactVirtualized__Grid__innerScrollContainer")

    for (var item of document.querySelectorAll(".item___CAjnz.item___ZYlyz")) {
        var itemID = item.querySelector(":scope > div img").getAttribute("src") // "/images/items/378/large.png?v=1555232..."
        itemID = itemID.match(/\d+/)[0]

        var currentPrice = item.querySelector(":scope .price___zTGNJ").textContent
        // when refreshing the highlights through the sidebar button, the DOM changes
        // with the profit amount will now be present thus why we need the split() here
        currentPrice = Number(currentPrice.split("$")[1].replaceAll(",",""))

        // item fetched from Torn API
        var apiItem = pricesTable.get(itemID)
        var sellingPrice = apiItem.price
        if (!sellingPrice) continue // a few items don't have one, I.G. "Pillow"

        console.log("[TMM] current selling price from API")
        console.log(sellingPrice)

        // profit not within desired margin
        if (sellingPrice - currentPrice < minProfit) continue

        // the class "tmm-highlight" is also used here as a controling flag
        // to detect whether an item has already been updated
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

        priceElement.appendChild(profitElement)
    }

    console.log("[TMM] done")
}

async function listenForChanges() {
    // wait for the dynamic list that will then load the items
    await requireElement(".ReactVirtualized__Grid__innerScrollContainer")

    var pricesTable = await getPricesTable()

    var list = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer")

    var config = { childList: true, subtree: true }
    var observer = new MutationObserver(callback)
    observer.observe(list, config)
    
    function callback(mutationsList) {
        for(const mutation of mutationsList) {
            // item removed (out of stock)
            // doing so forces the items below to fill the now empty space and requires
            // a full page refresh
            if (mutation.removedNodes.length === 1 && mutation.removedNodes[0].classList.contains("item___CAjnz")) {
                // console.log("[TMM] item removed, updating highlights")

                // process all items in the page
                showHighlight()
            } else if (mutation.addedNodes.length == 1 && mutation.addedNodes[0].classList.contains("row___nCKu7")) {
                // new row of items loaded
                
                // console.log("[TMM] handling new row of items")
                handleNewRow(pricesTable, mutation.addedNodes[0])
            }
        }
    }
}

// Rows are loaded and are hidden as the user scrolls down or up the page thus
// need to be handled differently than just processing every item on the page.
// Doing so also reduces the amount of work that has to be done compared to
// processing the entire page every time new items are loaded.
async function handleNewRow(pricesTable, newRow) {
    // always size 3, rows are loaded individually
    for (var item of newRow.querySelectorAll(":scope > div .item___CAjnz.item___ZYlyz")) {
        var itemID = item.querySelector(":scope > div img").getAttribute("src") // "/images/items/378/large.png?v=1555232..."
        itemID = itemID.match(/\d+/)[0]

        const currentPrice = item.querySelector(":scope > div p ~ p").lastChild.data
        currentPrice = Number(currentPrice.replaceAll(',',''))

        var name = item.querySelector(":scope > div .imgBar___RwG9v").getAttribute("aria-label")
        console.log(`[TMM] processing item ${name} selling for ${currentPrice}`)

        // item fetched from Torn API
        var apiItem = pricesTable.get(itemID)

        var sellingPrice = apiItem.price
        if (!sellingPrice) return // few items don't have one, I.G. "Pillow"

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