"use strict"

// categories (from the market left side panel) where discount percentages will be shown
var categoriesWithDiscounts = ["medical-items", "temporary-items", "energy-drinks", "candy", "drugs", "enhancers", "alcohol", "flowers", "clothing", "plushies", "special-items"]

// categories (from the market left side panel) where reselling profit will be shown
var categoriesWithResellingProfit = ["flowers", "plushies"]

window.addEventListener("trigger-highlight", showHighlight)

showHighlight()

async function showHighlight() {
    console.log("[TM+] market highlight script started")

    let apiKey = await get("apiKey")
    if (!apiKey) {
        console.log("[TM+] api key not set, aborting")
        return
    }

    var desiredMinProfit = await getMinProfit()
    var desiredMinPercentage = await getMinPercentage()
    var desiredMinPiggyBank = await getMinPiggyBankValue()
    var desiredMaxPiggyBankExpense = await getMaxPiggyBankExpense()

    // Can return early if the current page has already been highlighted.
    // This helps prevent multiple dom updates when pressing the refresh button.
    var earlyExit = document.querySelector("[aria-expanded='true'] > * .tmm-title-adjust")
    if (earlyExit) {
        console.log("[TM+] return early")
        return
    }

    var pricesTable = await getPricesTable()
    // TODO handle case where this fails

    await requireElement(".item-market-wrap div[aria-expanded='true'] li[data-item]", 20) // 5s

    var category = document.querySelector("[data-cat][aria-selected='true']").getAttribute("data-cat")

    for (var item of document.querySelectorAll(".item-market-wrap div[aria-expanded='true'] li[data-item]")) {
        const itemID = item.children[0].getAttribute("itemid")
        
        var nameAndCurrentPrice = item.children[0].getAttribute("aria-label").split(": $")
        const currentPrice = parseInt(nameAndCurrentPrice[1].replaceAll(',',''))

        const itemName = nameAndCurrentPrice[0]

        // early return if page already has highlights
        var titleElement = item.querySelector(":scope > .title")
        if (titleElement.classList.contains("tmm-title-adjust")) {
            console.log("[TM+] return early")
            return
        }

        // item fetched from Torn API
        var apiItem = pricesTable.get(itemID)

        var wrapperElement = document.createElement("div")
        wrapperElement.classList.add("tmm-wrapper")

        var profitElement = handleProfit(apiItem.price, currentPrice, desiredMinProfit)
        if (profitElement) {
            wrapperElement.appendChild(profitElement)
            titleElement.classList.add("tmm-title-adjust")
            titleElement.appendChild(wrapperElement)
        }

        var resellElement = handleProfitResell(apiItem.marketPrice, currentPrice, category)
        if (resellElement) {
            wrapperElement.appendChild(resellElement)
            titleElement.classList.add("tmm-title-adjust")
            titleElement.appendChild(wrapperElement)
        }

        var discountElement = handleDiscount(apiItem.marketPrice, currentPrice, category, desiredMinPercentage)
        if (discountElement) {
            var wrapper = item.querySelector(":scope .qty-wrap")
            wrapper.appendChild(discountElement)
        }

        var piggyBankElement = handlePiggyBank(apiItem.price, currentPrice, desiredMinPiggyBank, desiredMaxPiggyBankExpense)
        if (piggyBankElement && !profitElement) {
            var wrapper = item.querySelector(":scope .qty-wrap")
            wrapper.appendChild(piggyBankElement)
        }
    }

    console.log("[TM+] done")
}

// Decide if profit is within desired margin and build the node if needed.
function handleProfit(sellingPrice, currentPrice, desiredMinProfit) {
    // console.log(`[TM+] handleProfit: ${sellingPrice}, ${currentPrice}, ${desiredMinProfit}`)
    if (!sellingPrice) return // a few items don't have one, I.G. "Pillow"

    var profit = sellingPrice - currentPrice
    if (profit < desiredMinProfit) return

    var outerDiv = document.createElement("div")
    outerDiv.classList.add("tmm-resell-highlight")
    var innerText = document.createElement("span")
    innerText.classList.add("tmm-resell-text")
    innerText.appendChild(document.createTextNode(`$${profit.toLocaleString("en-US")}`))
    outerDiv.appendChild(innerText)

    return outerDiv
}

// TODO value gain from selling at current market price
function handleProfitResell(marketPrice, currentPrice, category) {
    // console.log(`[TM+] handleProfitResell: ${marketPrice}, ${currentPrice}, ${category}`)
    if (!marketPrice) return // a few items don't have one, I.G. "Pillow"

    if (!categoriesWithResellingProfit.includes(category)) return

    var profit = marketPrice - currentPrice
    if (profit < defaultMinProfitResell) return

    var outerDiv = document.createElement("div")
    outerDiv.classList.add("tmm-resell-highlight")
    var innerText = document.createElement("span")
    innerText.classList.add("tmm-resell-text")
    innerText.classList.add("tmm-test")
    innerText.appendChild(document.createTextNode(`$${profit.toLocaleString("en-US")}`))
    outerDiv.appendChild(innerText)

    return outerDiv
}

// Decide if discount is within desired margin and build the node if needed.
// Filters out categories not present in the `category` array.
function handleDiscount(marketPrice, currentPrice, category, desiredMinPercentage) {
    // console.log(`[TM+] handleDiscount: ${marketPrice}, ${currentPrice}, ${category}, ${desiredMinPercentage}`)
    if (!marketPrice) return // a few items don't have one, I.G. "Cleaver"

    if (!categoriesWithDiscounts.includes(category)) return
    
    var discountPercentage = 100 - Math.round(currentPrice * 100 / marketPrice)
    if (discountPercentage < desiredMinPercentage) return

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
function handlePiggyBank(sellingPrice, currentPrice, desiredMinPiggyBank, desiredMaxPiggyBankExpense) {
    if (!sellingPrice) return // a few items don't have one, I.G. "Pillow"

    if (sellingPrice < desiredMinPiggyBank) return

    if (Math.abs(sellingPrice - currentPrice) > desiredMaxPiggyBankExpense) return

    var icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("piggy-bank"))
    icon.classList.add("tmm-piggy-bank")

    return icon
}