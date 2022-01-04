"use strict";

showHighlight()

async function showHighlight() {
    // console.log("[TMM] highlight script started")

    // avoiding running the script multiple times when unnecessary. Opening the
    // prices of an item will make a XMLHttpRequest which will then trigger this
    // function. Changing the categories also triggers this but without a reload
    // of the page. All this makes it a bit tricky to handle due to the suggested
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

    var category = document.querySelector("[data-cat][aria-selected='true']").getAttribute("data-cat")

    // var totalProfit = 0

    for (var item of document.querySelectorAll(".item-market-wrap div[aria-expanded='true'] li[data-item]")) {
        var itemID = item.children[0].getAttribute("itemid")
        
        var nameAndCurrentPrice = item.children[0].getAttribute("aria-label").split(": $")
        var currentPrice = parseInt(nameAndCurrentPrice[1].replaceAll(',',''))

        // var name = nameAndCurrentPrice[0]

        // early return if page already has highlights
        var titleElement = item.querySelector(":scope > .title")
        if (titleElement.classList.contains("tmm-title-adjust")) {
            // console.log("[TMM] update of elements deemed not necessary")
            return
        }

        // item fetched from Torn API
        var apiItem = pricesTable.get(itemID)

        var wrapperElement = document.createElement("div")
        wrapperElement.classList.add("tmm-wrapper")

        var profitElement = handleProfit(apiItem.price, currentPrice)
        if (profitElement) {
            wrapperElement.appendChild(profitElement)
        }

        var discountElement = handleDiscount(apiItem.marketPrice, currentPrice, category)
        if (discountElement) {
            wrapperElement.appendChild(discountElement)
        }

        // update DOM if necessary
        if (profitElement || discountElement) {
            titleElement.classList.add("tmm-title-adjust")
            titleElement.appendChild(wrapperElement)
        }
    }

    // console.log("[TMM] done")
}

function handleProfit(sellingPrice, currentPrice) {
    if (!sellingPrice) return // a few items don't have one, I.G. "Pillow"

    var profit = sellingPrice - currentPrice
    if (profit < 50) return

    var outerDiv = document.createElement("div")
    outerDiv.classList.add("tmm-resell-highlight")
    var innerText = document.createElement("span")
    innerText.classList.add("tmm-resell-text")
    innerText.appendChild(document.createTextNode(`$${profit.toLocaleString("en-US")}`))
    outerDiv.appendChild(innerText)

    return outerDiv
}

function handleDiscount(marketPrice, currentPrice, category) {
    if (!marketPrice) return // a few items don't have one, I.G. "Cleaver"

    if (!CategoriesWithDiscounts.includes(category)) return
    
    var discountPercentage = 100 - Math.round(currentPrice * 100 / marketPrice)
    if (discountPercentage < 25) return

    var outerDiv = document.createElement("div")
    outerDiv.classList.add("tmm-resell-highlight")
    var innerText = document.createElement("span")
    innerText.classList.add("tmm-resell-text")
    innerText.appendChild(document.createTextNode(`${discountPercentage}%`))
    outerDiv.appendChild(innerText)

    return outerDiv
}

// categories (from the market left side panel) where discounts are shown
var CategoriesWithDiscounts = ["medical-items", "temporary-items", "energy-drinks", "candy", "drugs", "enhancers", "alcohol", "flowers", "clothing", "plushies", "special-items"]