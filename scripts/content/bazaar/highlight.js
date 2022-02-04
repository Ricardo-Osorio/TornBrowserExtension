"use strict"

showHighlight()
listenForChanges()

async function showHighlight() {
    console.log("[TM+] bazaar highlight script started")

    var pricesTable = await getPricesTable()
    // TODO handle case where this fails

    var desiredMinProfit = await getMinProfit()
    var desiredMinPercentage = await getMinPercentage()
    var desiredMinPiggyBank = await getMinPiggyBankValue()
    var desiredMaxPiggyBankExpense = await getMaxPiggyBankExpense()

    // bazaars consist of a dynamic list that loads new items as needed (scroll).
    // wait for that list to be present.
    await requireElement(".ReactVirtualized__Grid__innerScrollContainer", 20) // 5s

    for (var item of document.querySelectorAll(".item___CAjnz.item___ZYlyz")) {
        var itemID = item.querySelector(":scope > div img").getAttribute("src") // "/images/items/378/large.png?v=1555232..."
        itemID = itemID.match(/\d+/)[0]

        // var name = item.querySelector(":scope p.name___XWbmV").textContent

        var currentPrice = item.querySelector(":scope .price___zTGNJ").textContent
        // when refreshing the highlights through the sidebar button, the DOM changes
        // with the profit amount will now be present thus why we need the split() here
        currentPrice = Number(currentPrice.split("$")[1].replaceAll(",",""))

        // item fetched from Torn API
        var apiItem = pricesTable.get(itemID)

        // the class "tmm-highlight" is also used here as a controling flag
        // to detect whether an item has already been updated
        if (item.classList.contains("tmm-highlight")) {
            // console.log("[TM+] update of element deemed not necessary")
            continue
        }

        var profitElement = handleProfit(apiItem.price, currentPrice, desiredMinProfit)
        if (profitElement) {
            item.classList.add("tmm-highlight")

            var priceElement = item.querySelector(":scope > div .price___zTGNJ")
            priceElement.classList.add("tmm-flex-with-space")
            priceElement.appendChild(profitElement)
        }

        var discountElement = handleDiscount(apiItem.marketPrice, currentPrice, "category", desiredMinPercentage)
        if (discountElement) {
            var wrapper = item.querySelector(":scope .imgContainer___xJNhu")
            wrapper.appendChild(discountElement)
        }

        var piggyBankElement = handlePiggyBank(apiItem.price, currentPrice, desiredMinPiggyBank, desiredMaxPiggyBankExpense)
        if (piggyBankElement && !profitElement) {
            var wrapper = item.querySelector(":scope .imgContainer___xJNhu")
            wrapper.appendChild(piggyBankElement)
        }
    }

    console.log("[TM+] done")
}

// Decide if profit is within desired margin and build the node if needed.
function handleProfit(sellingPrice, currentPrice, desiredMinProfit) {
    if (!sellingPrice) return // a few items don't have one, I.G. "Pillow"

    var profit = sellingPrice - currentPrice
    if (profit < desiredMinProfit) return

    const profitElement = document.createElement("span")
    profitElement.classList.add("positive")
    profitElement.appendChild(document.createTextNode(`+ $${sellingPrice - currentPrice}`))

    return profitElement
}

// Decide if discount is within desired margin and build the node if needed.
// Filters out categories not present in the `category` array.
function handleDiscount(marketPrice, currentPrice, category, desiredMinPercentage) {
    if (!marketPrice) return // a few items don't have one, I.G. "Cleaver"

    // if (!categoriesWithDiscounts.includes(category)) return
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

async function listenForChanges() {
    // wait for the dynamic list that will then load the items
    await requireElement(".ReactVirtualized__Grid__innerScrollContainer", 20) // 5s

    var pricesTable = await getPricesTable()
    // TODO handle case where this fails

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
                // console.log("[TM+] item removed, updating highlights")

                // process all items in the page
                showHighlight()
            } else if (mutation.addedNodes.length == 1 && mutation.addedNodes[0].classList.contains("row___nCKu7")) {
                // new row of items loaded
                
                // console.log("[TM+] handling new row of items")
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
    var desiredMinProfit = await getMinProfit()
    var desiredMinPercentage = await getMinPercentage()
    var desiredMinPiggyBank = await getMinPiggyBankValue()
    var desiredMaxPiggyBankExpense = await getMaxPiggyBankExpense()

    // always size 3, rows are loaded individually
    for (var item of newRow.querySelectorAll(":scope > div .item___CAjnz.item___ZYlyz")) {
        var itemID = item.querySelector(":scope > div img").getAttribute("src") // "/images/items/378/large.png?v=1555232..."
        itemID = itemID.match(/\d+/)[0]

        var currentPrice = item.querySelector(":scope > div p ~ p").lastChild.data
        currentPrice = Number(currentPrice.replaceAll(',',''))

        // var name = item.querySelector(":scope > div .imgBar___RwG9v").getAttribute("aria-label")
        // console.log(`[TM+] processing item ${name} selling for ${currentPrice}`)

        // item fetched from Torn API
        var apiItem = pricesTable.get(itemID)

        var profitElement = handleProfit(apiItem.price, currentPrice, desiredMinProfit)
        if (profitElement) {
            item.classList.add("tmm-highlight")

            var priceElement = item.querySelector(":scope > div .price___zTGNJ")
            priceElement.classList.add("tmm-flex-with-space")
            priceElement.appendChild(profitElement)
        }

        var discountElement = handleDiscount(apiItem.marketPrice, currentPrice, "category", desiredMinPercentage)
        if (discountElement) {
            var wrapper = item.querySelector(":scope .imgContainer___xJNhu")
            wrapper.appendChild(discountElement)
        }

        var piggyBankElement = handlePiggyBank(apiItem.price, currentPrice, desiredMinPiggyBank, desiredMaxPiggyBankExpense)
        if (piggyBankElement && !profitElement) {
            var wrapper = item.querySelector(":scope .imgContainer___xJNhu")
            wrapper.appendChild(piggyBankElement)
        }
    }
}