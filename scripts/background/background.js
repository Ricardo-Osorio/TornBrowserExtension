"use strict"

// Listen for requests to the URL below. Unfortunatly pretty much all GET requests
// look almost the same and match "https://www.torn.com/imarket.php?rfcv=*", example:
//  - loading the the market page;
//  - loading the user's listings on the market;
//  - loading each market category (this is why two requests are always made loading the
//  market page for the first time);
//  - fetching an item price's data (when pressing an item and more information is shown);
//  - loading each page of a users listings on the market.
// Hence why we add a filter based on the URL of the current open tab.
browser.webRequest.onCompleted.addListener(
    requestHandler,
    {urls: ["https://www.torn.com/imarket.php?rfcv=*"]}
)

apiDataControlLoop()

async function requestHandler() {
    browser.tabs.query({currentWindow: true, active: true})
    .then((tabs) => {
        if (regexListingsPage.test(tabs[0].url)) {
            // console.log("[TM+] background script detected request on listings page")
            browser.tabs.executeScript({
                file: "/scripts/content/listings/listings.js"
            })
        } else if (regexMarketPage.test(tabs[0].url)) {
            // console.log("[TM+] background script detected request on market page")
            browser.tabs.executeScript({
                file: "/scripts/content/market/highlight.js"
            })
        }
    })
}

async function apiDataControlLoop() {
    while (true) {
        console.log("[TM+] new loop iteration")

        // timestamp of previous data update
        var lastUpdateTs
        let currentTs = Date.now()

        var storedObj = await browser.storage.local.get("timestamp")
        if (!storedObj.timestamp) { // no data stored, can be the first run or it was deleted
            console.log("[TM+] no timestamp found")
            lastUpdateTs = Date.now() - 2*msInMinute // fake value to force an update
        } else {
            lastUpdateTs = storedObj.timestamp
        }

        if (currentTs - lastUpdateTs > msInMinute ) {
            console.log("[TM+] more than a minute since last update")
            var pricesTable = await fetchItemsFromAPI()
            if (typeof pricesTable === 'undefined') {
                console.log("[TM+] failed to fetch items, aborting")
                continue
            }
            browser.storage.local.set({pricesTable, timestamp: currentTs})
        } else {
            console.log("[TM+] less than a minute since last update")
        }

        await sleep(msInMinute)
    }
}