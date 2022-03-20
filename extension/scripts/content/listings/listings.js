"use strict"

handleRequest()

async function handleRequest() {
    console.log("[TM+] listings script started")

    await requireElement("#display-request-state", 3) // 0.75s
    var priceChangeNode = document.querySelector("#display-request-state")
    if (!priceChangeNode) return

    var textContent = priceChangeNode.querySelector(":scope p").textContent // You changed your price for Kitten Plushie to $3,945.
    
    var targetPrice = parseInt(textContent.match(/(\d+,?\d+)+/)[0].replace(",","")) // 3,945 => 3945
    var targetName = textContent.match(/for\s((\w)+\s?)+\sto/)[0] // "for Kitten Plushie to"
    targetName = targetName.slice(4,-3) // Kitten Plushie

    console.log(`[TM+] detected item ${targetName} price change to ${targetPrice}`)

    for (var item of document.querySelectorAll("li.market-item")) {
        var name = item.querySelector(":scope div.desc > span").textContent

        if (name !== targetName) {
            console.log(`[TM+] item name ${name} does not match ${targetName}, skipping`)
            continue
        }

        var priceInputHidden = item.querySelector(':scope input[type="hidden"]')
        var currentPrice = priceInputHidden.value // $3,945
        currentPrice = parseInt(currentPrice.slice(1).replaceAll(",",""))

        if (currentPrice == targetPrice) {
            console.log(`[TM+] item ${name} price does not need update, skipping`)
            continue
        }

        var button = item.querySelector(":scope span.change")
        button.click()

        priceInputHidden.value = targetPrice

        button.click()

        var confirm = item.querySelector(":scope div.pay-fee span.yes a")
        confirm.click()

        console.log(`[TM+] item ${name} price updated from ${currentPrice} to ${targetPrice}`)
    }

    await retryRemove()
}

async function retryRemove() {
    for (let i = 0; i < 3; i++) {
        await requireElement("#display-request-state", 3) // 0.75s
        var priceChangeNode = document.querySelector("#display-request-state")
        if (!priceChangeNode) return
        priceChangeNode.remove()
    }
}