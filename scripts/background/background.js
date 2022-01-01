function marketListener(details) {
    browser.tabs.executeScript({
        file: "/scripts/content/market/highlight.js"
    })
}

browser.webRequest.onCompleted.addListener(
    marketListener,
    {urls: ["https://www.torn.com/imarket.php?rfcv=*"]}
)