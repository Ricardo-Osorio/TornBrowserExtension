"use strict"

apiDataControlLoop()

async function apiDataControlLoop() {
    while (true) {
        console.log("[TM+] new loop iteration")

        // timestamp of last data update
        var lastTs
        let timestamp = Date.now()

        var storedObj = await browser.storage.local.get("timestamp")
        if (!storedObj.timestamp) { // no data stored, can be the first run or it was deleted
            console.log("[TM+] no timestamp found")
            lastTs = Date.now() - msInMinute // fake value to force an update
        } else {
            lastTs = storedObj.timestamp
        }

        if (timestamp - lastTs > msInMinute ) {
            console.log("[TM+] more than a minute since last update")
            var pricesTable = await fetchItemsFromAPI()
            if (typeof pricesTable === 'undefined') {
                console.log("[TM+] failed to fetch items, aborting")
                continue
            }
            browser.storage.local.set({pricesTable, timestamp})
        } else {
            console.log("[TM+] less than a minute since last update")
        }

        await sleep(msInMinute)
    }
}