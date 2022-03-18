"use strict"

// number of milliseconds in a minute
const msInMinute = 60000
const regexListingsPage = new RegExp("^https:\/\/www\.torn\.com\/imarket\.php#\/p=your.*")
const regexMarketPage = new RegExp("^https:\/\/www\.torn\.com\/imarket\.php#\/p=market.*")

chrome.alarms.create({ 
    delayInMinutes: 0,
    periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener(() => {
    apiDataControlLoop()
})

// Listen for requests to the URL below. Unfortunately pretty much all GET requests
// look almost the same and match "https://www.torn.com/imarket.php?rfcv=*", example:
//  - loading the the market page;
//  - loading the user's listings on the market;
//  - loading each market category (this is why two requests are always made loading the
//  market page for the first time);
//  - fetching an item price's data (when pressing an item and more information is shown);
//  - loading each page of a users listings on the market.
// Hence why we add a filter based on the URL of the current open tab.
chrome.webRequest.onCompleted.addListener(
    requestHandler,
    {urls: ["https://www.torn.com/imarket.php?rfcv=*"]}
    // ["blocking"]
)

function requestHandler() {
    chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
        if (regexListingsPage.test(tabs[0].url)) {
            // console.log("[TM+] background script detected request on listings page")
            chrome.scripting.executeScript({
                files: ["/scripts/content/listings/listings.js"],
                target: {tabId: tabs[0].id}
            })
        } else if (regexMarketPage.test(tabs[0].url)) {
            // console.log("[TM+] background script detected request on market page")
            chrome.scripting.executeScript({
                files: ["/scripts/content/market/highlight.js"],
                target: {tabId: tabs[0].id}
            })
        }
    })
}

async function apiDataControlLoop() {
    console.log("[TM+] new loop iteration")

    // timestamp of previous data update
    var lastUpdateTs
    let currentTs = Date.now()

    var timestamp = await get("timestamp")
    if (!timestamp) { // no data stored, can be the first run or it was deleted
        console.log("[TM+] no timestamp found")
        lastUpdateTs = Date.now() - 2*msInMinute // fake value to force an update
    } else {
        lastUpdateTs = timestamp
    }

    if (currentTs - lastUpdateTs > msInMinute ) {
        console.log("[TM+] more than a minute since last update")
        var pricesTable = await fetchItemsFromAPI()
        if (typeof pricesTable === 'undefined') {
            console.log("[TM+] failed to fetch items, aborting")
            return
        }

        await set({pricesTable, timestamp: currentTs})
    } else {
        console.log("[TM+] less than a minute since last update")
    }
}

async function fetchItemsFromAPI () {
    console.log("[TM+] fetching item list from API")

    var apiKey = await get("apiKey")
    if (!apiKey) console.log("[TM+] api key not found")
    // TODO handle case where this is not found

    var url = "https://api.torn.com/torn/?selections=items&key="+apiKey
    let response = await fetch(url)
    let data = await response.json()
    if (!data.items) return

    let pricesTable = new Map()

    // extract a map[item ID] -> {selling price, market price}
    Object.keys(data.items).forEach((key, index) => {
        pricesTable.set(
            key, 
            {
                price: data.items[key].sell_price,
                marketPrice: data.items[key].market_value
            }
        )
    })

    console.log("[TM+] API request successful")
    return pricesTable
}

function get(key) {
    return new Promise(async (resolve) => {
        const data = await new Promise((resolve) => chrome.storage.local.get([key], (data) => resolve(data)))
        resolve(data[key])
    })
}

function set(object) {
    return new Promise((resolve) => chrome.storage.local.set(object, () => resolve()))
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}