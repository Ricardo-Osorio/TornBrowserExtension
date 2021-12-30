function listener(details) {
    browser.tabs.executeScript({
        file: "/content/highlight.js"
    })
}

browser.webRequest.onCompleted.addListener(
    listener,
    {urls: ["https://www.torn.com/imarket.php?rfcv=*"]}
)