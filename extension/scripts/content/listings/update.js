"use strict"

window.addEventListener("update-listing-price", handleRequest)

let updateInProgress = false

async function handleRequest(event) {
    console.log("[TM+] listings script started")

    if (updateInProgress)  {
        console.log("[TM+] price update already in progress, aborted")
        return
    }
    updateInProgress = true

    const { price } = event.detail

    await requireElement("#display-request-state p", 4) // 1s
    let priceChangeNode = document.querySelector("#display-request-state p")
    if (!priceChangeNode) {
        updateInProgress = false
        return
    }

    let textContent = priceChangeNode.textContent // "You changed your price for Kitten Plushie to $3,945.""
    
    let targetName = textContent.match(/for\s((\w)+\s?)+\sto/)[0] // "for Kitten Plushie to"
    targetName = targetName.slice(4,-3) // "Kitten Plushie"

    console.log(`[TM+] detected item ${targetName} price change to ${price}`)

    for (let item of document.querySelectorAll("li.market-item")) {
        let name = item.querySelector(":scope div.desc > span").textContent

        if (name !== targetName) {
            // console.log(`[TM+] item name ${name} does not match ${targetName}, skipping`)
            continue
        }

        let priceInputHidden = item.querySelector(':scope input[type="hidden"]')
        let currentPrice = priceInputHidden.value // "$3,945"
        currentPrice = parseInt(currentPrice.slice(1).replaceAll(",","")) // "3,945"

        if (currentPrice == price) {
            // console.log(`[TM+] item ${name} price does not need update, skipping`)
            continue
        }

        let button = item.querySelector(":scope span.change")
        button.click()

        priceInputHidden.value = price

        button.click()

        let confirm = item.querySelector(":scope div.pay-fee span.yes a")
        confirm.click()

        console.log(`[TM+] item ${name} price updated from ${currentPrice} to ${price}`)
    }

    await sleep(750) // 0,75s
    updateInProgress = false
}