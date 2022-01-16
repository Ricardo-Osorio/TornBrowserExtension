"use strict"

// categories (from the market left side panel) where discount percentages will be shown
var categoriesWithDiscounts = ["medical-items", "temporary-items", "energy-drinks", "candy", "drugs", "enhancers", "alcohol", "flowers", "clothing", "plushies", "special-items"]

showHighlight()

async function showHighlight() {
    if (regexListingsPage.test(location.href)) {
        console.log("[TMM] market script matched listings page URL, aborting")
        return
    }

    var unlock = await marketScriptMutex.lock()
    
    console.log("[TMM] market highlight script started")

    // Can return early if the current page has already been highlighted.
    // This helps prevent multiple dom updates when pressing the refresh button.
    var earlyExit = document.querySelector("[aria-expanded='true'] > * .tmm-title-adjust")
    if (earlyExit) {
        console.log("[TMM] return early")
        unlock()
        return
    }

    var pricesTable = await getPricesTable()

    await requireElement(".item-market-wrap div[aria-expanded='true'] li[data-item]", 20) // 5s

    var category = document.querySelector("[data-cat][aria-selected='true']").getAttribute("data-cat")

    for (var item of document.querySelectorAll(".item-market-wrap div[aria-expanded='true'] li[data-item]")) {
        const itemID = item.children[0].getAttribute("itemid")
        
        var nameAndCurrentPrice = item.children[0].getAttribute("aria-label").split(": $")
        const currentPrice = parseInt(nameAndCurrentPrice[1].replaceAll(',',''))

        // var itemName = nameAndCurrentPrice[0]

        // early return if page already has highlights
        var titleElement = item.querySelector(":scope > .title")
        if (titleElement.classList.contains("tmm-title-adjust")) {
            console.log("[TMM] return early")
            unlock()
            return
        }

        // item fetched from Torn API
        var apiItem = pricesTable.get(itemID)

        var wrapperElement = document.createElement("div")
        wrapperElement.classList.add("tmm-wrapper")

        var profitElement = handleProfit(apiItem.price, currentPrice)
        if (profitElement) {
            wrapperElement.appendChild(profitElement)
            titleElement.classList.add("tmm-title-adjust")
            titleElement.appendChild(wrapperElement)
        }

        var discountElement = handleDiscount(apiItem.marketPrice, currentPrice, category)
        if (discountElement) {
            var wrapper = item.querySelector(":scope .qty-wrap")
            wrapper.appendChild(discountElement)
        }

        var piggyBankElement = handlePiggyBank(apiItem.price, currentPrice)
        if (piggyBankElement && !profitElement) {
            var wrapper = item.querySelector(":scope .qty-wrap")
            wrapper.appendChild(piggyBankElement)
        }
    }

    console.log("[TMM] done")
    unlock()
}

// Decide if profit is within desired margin and build the node if needed.
function handleProfit(sellingPrice, currentPrice) {
    if (!sellingPrice) return // a few items don't have one, I.G. "Pillow"

    var profit = sellingPrice - currentPrice
    if (profit < minProfit) return

    var outerDiv = document.createElement("div")
    outerDiv.classList.add("tmm-resell-highlight")
    var innerText = document.createElement("span")
    innerText.classList.add("tmm-resell-text")
    innerText.appendChild(document.createTextNode(`$${profit.toLocaleString("en-US")}`))
    outerDiv.appendChild(innerText)

    return outerDiv
}

// Decide if discount is within desired margin and build the node if needed.
// Filters out categories not present in the `category` array.
function handleDiscount(marketPrice, currentPrice, category) {
    if (!marketPrice) return // a few items don't have one, I.G. "Cleaver"

    if (!categoriesWithDiscounts.includes(category)) return
    
    var discountPercentage = 100 - Math.round(currentPrice * 100 / marketPrice)
    if (discountPercentage < minPercentage) return

    var outerDiv = document.createElement("div");
    outerDiv.style.backgroundImage = "url("+getIconURL("sale")+")"
    outerDiv.classList.add("tmm-discount")
    var innerText = document.createElement("span")
    innerText.classList.add("tmm-discount-text")
    innerText.appendChild(document.createTextNode(`${discountPercentage}%`))
    outerDiv.appendChild(innerText)

    return outerDiv
}

// Decide if profit is within desired margin and build the node if needed.
function handlePiggyBank(sellingPrice, currentPrice) {
    if (!sellingPrice) return // a few items don't have one, I.G. "Pillow"

    if (sellingPrice < minPiggyBankValue) return

    if (Math.abs(sellingPrice - currentPrice) > maxPiggyBankExpense) {
        console.log("TMM update not done?")
        return
    }

    var icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("piggy-bank"))
    icon.classList.add("tmm-piggy-bank")

    return icon
}