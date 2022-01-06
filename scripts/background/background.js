// listen to request to the URL below. These are made when:
// - the market page is first loaded
// - each market category is loaded (why two requests are always made loading the market page)
// - fetching an item price's data (when pressing an item and more information is shown)
browser.webRequest.onCompleted.addListener(
    marketListener,
    {urls: ["https://www.torn.com/imarket.php?rfcv=*"]}
)

function marketListener(details) {
    console.log(details)
    browser.tabs.executeScript({
        file: "/scripts/content/market/highlight.js"
    })
}