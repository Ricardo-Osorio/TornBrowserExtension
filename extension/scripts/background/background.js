"use strict"

// number of milliseconds in a minute
const msInMinute = 60000

chrome.alarms.create({
    delayInMinutes: 0,
    periodInMinutes: 1
})

chrome.alarms.onAlarm.addListener(() => {
    apiDataControlLoop()
})

async function apiDataControlLoop() {
    console.log("[TM+] checking API data")

    let currentTs = Date.now()

    let timestamp = await get("timestamp")
    if (timestamp && currentTs - timestamp < msInMinute) {
        console.log("[TM+] less than a minute since last update")
        return
    }

    console.log("[TM+] more than a minute since last update")
    let pricesTable = await fetchItemsFromAPI()
    if (typeof pricesTable === 'undefined') {
        console.log("[TM+] failed to fetch items, aborting")
        return
    }

    let pricesTableObj = Object.fromEntries(pricesTable)
    set({pricesTableObj, timestamp: currentTs})
}

async function fetchItemsFromAPI () {
    console.log("[TM+] fetching item list from API")

    let apiKey = await get("apiKey")
    if (!apiKey) {
        console.log("[TM+] api key not found")
        return
    }
    // TODO handle case where this is not found

    let url = "https://api.torn.com/torn/?selections=items&key="+apiKey
    let response = await fetch(url)
    let data = await response.json()
    if (!data.items) return

    let pricesTable = new Map()

    let count = 0
    // extract a map[item ID] -> {selling price, market price}
    Object.keys(data.items).forEach((key, index) => {
        pricesTable.set(
            key, 
            {
                price: data.items[key].sell_price,
                marketPrice: data.items[key].market_value
            }
        )
        count++
    })

    console.log(`[TM+] API request successful, stored ${count} items`)
    return pricesTable
}

function get(key) {
    return new Promise(async (resolve) => {
        const data = await new Promise((resolve) => chrome.storage.local.get(key, (data) => resolve(data)))
        resolve(data[key])
    })
}

function set(object) {
    return new Promise((resolve) => chrome.storage.local.set(object, () => resolve()))
}