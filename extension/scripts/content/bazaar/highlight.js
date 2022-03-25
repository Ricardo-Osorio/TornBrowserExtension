"use strict"

showHighlight()
listenForChanges()
saveBazaar()

function saveBazaar() {
    let lastBazaar = window.location.href
    set({lastBazaar})
}

async function showHighlight() {
    console.log("[TM+] bazaar highlight script started")

    let apiKey = await get("apiKey")
    if (!apiKey) {
        console.log("[TM+] api key not set, aborting")
        return
    }

    let pricesTable = await getPricesTable()
    
    let categorySettings = await getCategorySettings()

    let desiredMinProfit = await getMinProfit()
    let desiredMinPercentage = await getMinPercentage()
    let desiredMinPiggyBank = await getMinPiggyBankValue()
    let desiredMaxPiggyBankExpense = await getMaxPiggyBankExpense()

    // bazaars consist of a dynamic list that loads new items as needed (scroll).
    // wait for that list to be present.
    await requireElement(".ReactVirtualized__Grid__innerScrollContainer", 20) // 5s

    for (let item of document.querySelectorAll(".item___CAjnz.item___ZYlyz")) {
        let itemID = item.querySelector(":scope > div img").getAttribute("src") // "/images/items/378/large.png?v=1555232..."
        itemID = itemID.match(/\d+/)[0]

        // let name = item.querySelector(":scope p.name___XWbmV").textContent

        let currentPrice = item.querySelector(":scope .price___zTGNJ").textContent
        // when refreshing the highlights through the sidebar button, the DOM changes
        // with the profit amount will now be present thus why we need the split() here
        currentPrice = Number(currentPrice.split("$")[1].replaceAll(",",""))

        // items selling for 1$ at bazaars are locked for everyone
        if (currentPrice === 1) {
            continue
        }

        // item fetched from Torn API
        let apiItem = pricesTable.get(itemID)

        // the class "tmm-highlight" is also used here as a controling flag
        // to detect whether an item has already been updated
        if (item.classList.contains("tmm-highlight")) {
            // console.log("[TM+] update of element deemed not necessary")
            continue
        }

        if (categorySettings.get(apiItem.category).shop) {
            let profitElement = handleProfit(apiItem.price, currentPrice, desiredMinProfit)
            if (profitElement) {
                item.classList.add("tmm-highlight")
    
                let priceElement = item.querySelector(":scope > div .price___zTGNJ")
                priceElement.classList.add("tmm-flex-with-space")
                priceElement.appendChild(profitElement)
            }
        }

        if (categorySettings.get(apiItem.category).sale) {
            let discountElement = handleDiscount(apiItem.marketPrice, currentPrice, desiredMinPercentage)
            if (discountElement) {
                let wrapper = item.querySelector(":scope .imgContainer___xJNhu")
                wrapper.appendChild(discountElement)
            }
        }

        let piggyBankElement = handlePiggyBank(apiItem.price, currentPrice, desiredMinPiggyBank, desiredMaxPiggyBankExpense)
        if (piggyBankElement && typeof profitElement === 'undefined') { // mutual exclusive
            let wrapper = item.querySelector(":scope .imgContainer___xJNhu")
            wrapper.appendChild(piggyBankElement)
        }
    }

    console.log("[TM+] done")
}

// Decide if profit is within desired margin and build the node if needed.
function handleProfit(sellingPrice, currentPrice, desiredMinProfit) {
    if (!sellingPrice) return // a few items don't have one, I.G. "Pillow"

    let profit = sellingPrice - currentPrice
    if (profit < desiredMinProfit) return

    const profitElement = document.createElement("span")
    profitElement.classList.add("positive")
    profitElement.appendChild(document.createTextNode(`+ $${sellingPrice - currentPrice}`))

    return profitElement
}

// Decide if discount is within desired margin and build the node if needed.
function handleDiscount(marketPrice, currentPrice, desiredMinPercentage) {
    if (!marketPrice) return // a few items don't have one, I.G. "Cleaver"

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

async function listenForChanges() {
    // wait for the dynamic list that will then load the items
    await requireElement(".ReactVirtualized__Grid__innerScrollContainer", 20) // 5s

    let pricesTable = await getPricesTable()

    let categorySettings = await getCategorySettings()

    let list = document.querySelector(".ReactVirtualized__Grid__innerScrollContainer")

    let config = { childList: true, subtree: true }
    let observer = new MutationObserver(callback)
    observer.observe(list, config)
    
    function callback(mutationsList) {
        for(const mutation of mutationsList) {
            // item removed (out of stock)
            // doing so forces the items below to fill the now empty space and requires
            // a full page refresh
            if (mutation.removedNodes.length === 1 && mutation.removedNodes[0].classList && mutation.removedNodes[0].classList.contains("item___CAjnz")) {
                // console.log("[TM+] item removed, updating highlights")

                // process all items in the page
                showHighlight()

            // TODO handle case where a node is added with class=itemDescription___AsJM4 and parent with class=item___CAjnz
            // This happens when the buy menu is closed
            } else if (mutation.addedNodes.length == 1 && mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.contains("row___nCKu7")) {
                // new row of items loaded
                
                // console.log("[TM+] handling new row of items")
                handleNewRow(pricesTable, categorySettings, mutation.addedNodes[0])
            }
        }
    }
}

// Rows are loaded and are hidden as the user scrolls down or up the page thus
// need to be handled differently than just processing every item on the page.
// Doing so also reduces the amount of work that has to be done compared to
// processing the entire page every time new items are loaded.
async function handleNewRow(pricesTable, categorySettings, newRow) {
    let desiredMinProfit = await getMinProfit()
    let desiredMinPercentage = await getMinPercentage()
    let desiredMinPiggyBank = await getMinPiggyBankValue()
    let desiredMaxPiggyBankExpense = await getMaxPiggyBankExpense()

    // always size 3, rows are loaded individually
    for (let item of newRow.querySelectorAll(":scope > div .item___CAjnz.item___ZYlyz")) {
        let itemID = item.querySelector(":scope > div img").getAttribute("src") // "/images/items/378/large.png?v=1555232..."
        itemID = itemID.match(/\d+/)[0]

        let currentPrice = item.querySelector(":scope > div p ~ p").lastChild.data
        currentPrice = Number(currentPrice.replaceAll(',',''))

        // items selling for 1$ at bazaars are locked for everyone
        if (currentPrice === 1) {
            continue
        }

        // let name = item.querySelector(":scope > div .imgBar___RwG9v").getAttribute("aria-label")
        // console.log(`[TM+] processing item ${name} selling for ${currentPrice}`)

        // item fetched from Torn API
        let apiItem = pricesTable.get(itemID)

        if (categorySettings.get(apiItem.category).shop) {
            let profitElement = handleProfit(apiItem.price, currentPrice, desiredMinProfit)
            if (profitElement) {
                item.classList.add("tmm-highlight")

                let priceElement = item.querySelector(":scope > div .price___zTGNJ")
                priceElement.classList.add("tmm-flex-with-space")
                priceElement.appendChild(profitElement)
            }
        }

        if (categorySettings.get(apiItem.category).sale) {
            let discountElement = handleDiscount(apiItem.marketPrice, currentPrice, desiredMinPercentage)
            if (discountElement) {
                let wrapper = item.querySelector(":scope .imgContainer___xJNhu")
                wrapper.appendChild(discountElement)
            }
        }

        let piggyBankElement = handlePiggyBank(apiItem.price, currentPrice, desiredMinPiggyBank, desiredMaxPiggyBankExpense)
        if (piggyBankElement && typeof profitElement === 'undefined') { // mutual exclusive
            let wrapper = item.querySelector(":scope .imgContainer___xJNhu")
            wrapper.appendChild(piggyBankElement)
        }
    }
}