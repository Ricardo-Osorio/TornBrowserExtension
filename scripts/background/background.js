"use strict"

// Listen for request to the URL below. Unfortunatly pretty much all GET requests
// look almost the same and match "https://www.torn.com/imarket.php?rfcv=*", example:
//  - loading the the market page;
//  - loading the user's listings on the market;
//  - loading each market category (this is why two requests are always made loading the
//  market page for the first time);
//  - fetching an item price's data (when pressing an item and more information is shown);
//  - loading each page of a users listings on the market.
// Hence why we must filter by the URL as well.

browser.webRequest.onCompleted.addListener(
    requestHandler,
    {urls: ["https://www.torn.com/imarket.php?rfcv=*"]}
)

async function requestHandler() {
    browser.tabs.query({currentWindow: true, active: true})
    .then((tabs) => {
        if (regexMarketListings.test(tabs[0].url)) {
            console.log("[TMM] background script detected request on listings page")
            browser.tabs.executeScript({
                file: "/scripts/content/listings/listings.js"
            })
        } else if (regexMarketPage.test(tabs[0].url)) {
            console.log("[TMM] background script detected request on market page")
            browser.tabs.executeScript({
                file: "/scripts/content/market/highlight.js"
            })
        }
    })
}