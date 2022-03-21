"use strict"

// categories (from the market left side panel) where discount percentages will be shown
let categoriesWithDiscounts = ["medical-items", "temporary-items", "energy-drinks", "candy", "drugs", "enhancers", "alcohol", "flowers", "clothing", "plushies", "special-items"]

// categories (from the market left side panel) where reselling profit will be shown
let categoriesWithResellingProfit = ["flowers", "plushies"]

window.addEventListener("trigger-highlight", showHighlight)

showHighlight()

async function showHighlight() {
    console.log("[TM+] market highlight script started")

    let apiKey = await get("apiKey")
    if (!apiKey) {
        console.log("[TM+] api key not set, aborting")
        return
    }

    let desiredMinProfit = await getMinProfit()
    let desiredMinPercentage = await getMinPercentage()
    let desiredMinPiggyBank = await getMinPiggyBankValue()
    let desiredMaxPiggyBankExpense = await getMaxPiggyBankExpense()

    // Can return early if the current page has already been highlighted.
    // This helps prevent multiple dom updates when pressing the refresh button.
    let earlyExit = document.querySelector("[aria-expanded='true'] > * .tmm-title-adjust")
    if (earlyExit) {
        console.log("[TM+] return early")
        return
    }

    let pricesTable = await getPricesTable()
    // TODO handle case where this fails

    await requireElement(".item-market-wrap div[aria-expanded='true'] li[data-item]", 20) // 5s

    let category = document.querySelector("[data-cat][aria-selected='true']").getAttribute("data-cat")

    for (let item of document.querySelectorAll(".item-market-wrap div[aria-expanded='true'] li[data-item]")) {
        const itemID = item.children[0].getAttribute("itemid")
        
        let nameAndCurrentPrice = item.children[0].getAttribute("aria-label").split(": $")
        const currentPrice = parseInt(nameAndCurrentPrice[1].replaceAll(',',''))

        const itemName = nameAndCurrentPrice[0]

        // early return if page already has highlights
        let titleElement = item.querySelector(":scope > .title")
        if (titleElement.classList.contains("tmm-title-adjust")) {
            console.log("[TM+] return early")
            return
        }

        // item fetched from Torn API
        let apiItem = pricesTable.get(itemID)

        let wrapperElement = document.createElement("div")
        wrapperElement.classList.add("tmm-wrapper")

        let profitElement = handleProfit(apiItem.price, currentPrice, desiredMinProfit)
        if (profitElement) {
            wrapperElement.appendChild(profitElement)
            titleElement.classList.add("tmm-title-adjust")
            titleElement.appendChild(wrapperElement)
        }

        let resellElement = handleProfitResell(apiItem.marketPrice, currentPrice, category)
        if (resellElement) {
            wrapperElement.appendChild(resellElement)
            titleElement.classList.add("tmm-title-adjust")
            titleElement.appendChild(wrapperElement)
        }

        let discountElement = handleDiscount(apiItem.marketPrice, currentPrice, category, desiredMinPercentage)
        if (discountElement) {
            let wrapper = item.querySelector(":scope .qty-wrap")
            wrapper.appendChild(discountElement)
        }

        let piggyBankElement = handlePiggyBank(apiItem.price, currentPrice, desiredMinPiggyBank, desiredMaxPiggyBankExpense)
        if (piggyBankElement && !profitElement) {
            let wrapper = item.querySelector(":scope .qty-wrap")
            wrapper.appendChild(piggyBankElement)
        }
    }

    console.log("[TM+] done")
}

// Decide if profit is within desired margin and build the node if needed.
function handleProfit(sellingPrice, currentPrice, desiredMinProfit) {
    // console.log(`[TM+] handleProfit: ${sellingPrice}, ${currentPrice}, ${desiredMinProfit}`)
    if (!sellingPrice) return // a few items don't have one, I.G. "Pillow"

    let profit = sellingPrice - currentPrice
    if (profit < desiredMinProfit) return

    let outerDiv = document.createElement("div")
    outerDiv.classList.add("tmm-resell-highlight")
    let innerText = document.createElement("span")
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

    let profit = marketPrice - currentPrice
    if (profit < defaultMinProfitResell) return

    let outerDiv = document.createElement("div")
    outerDiv.classList.add("tmm-resell-highlight")
    let innerText = document.createElement("span")
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
    
    let discountPercentage = 100 - Math.round(currentPrice * 100 / marketPrice)
    if (discountPercentage < desiredMinPercentage) return

    let outerDiv = document.createElement("div");
    outerDiv.style.backgroundImage = "url("+getIconURL("sale")+")"
    outerDiv.classList.add("tmm-discount")
    let innerText = document.createElement("span")
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

    let icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("piggy-bank"))
    icon.classList.add("tmm-piggy-bank")

    return icon
}