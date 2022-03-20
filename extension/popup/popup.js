setInitialValues()

async function setInitialValues() {
    var apiKey = await get("apiKey")
    var minProfit = await get("minProfit")
    var minPercentage = await get("minPercentage")
    var minPiggyBankValue = await get("minPiggyBankValue")
    var maxPiggyBankExpense = await get("maxPiggyBankExpense")

    if (!apiKey || apiKey === "") {
        console.log("no api key")
        // TODO handle case
    } else {
        document.querySelector("#apikey").value = apiKey
    }

    if (minProfit) document.querySelector("#minProfit").value = minProfit
    if (minPercentage) document.querySelector("#minPercentage").value = minPercentage
    if (minPiggyBankValue) document.querySelector("#minPiggyBankValue").value = minPiggyBankValue
    if (maxPiggyBankExpense) document.querySelector("#maxPiggyBankExpense").value = maxPiggyBankExpense
}

document.querySelector("#apikeybtn").addEventListener("click", setApiKey)
document.querySelector("#valuesbtn").addEventListener("click", setConfigValues)

async function setApiKey() {
    var apiKey = document.querySelector("#apikey").value
    if (apiKey == "") {
        // invalid
    }
    // console.log(`[TM+] api key: ${apiKey}`)
    await set({apiKey})
}

async function setConfigValues() {
    console.log("setConfigValues")
    var minProfit = document.querySelector("#minProfit").value
    if (minProfit == "" || minProfit < 1) {
        // invalid
    }

    var minPercentage = document.querySelector("#minPercentage").value
    if (minPercentage == "" || minPercentage < 1) {
        // invalid
    }

    var minPiggyBankValue = document.querySelector("#minPiggyBankValue").value
    if (minPiggyBankValue == "" || minPiggyBankValue < 1) {
        // invalid
    }

    var maxPiggyBankExpense = document.querySelector("#maxPiggyBankExpense").value
    if (maxPiggyBankExpense == "" || maxPiggyBankExpense < 1) {
        // invalid
    }

    console.log(`[TM+] min profit: ${minProfit}, min percentage: ${minPercentage}, min piggy bank ${minPiggyBankValue}, max piggy bank expense: ${maxPiggyBankExpense}`)
    await set(minProfit)
    await set(minPercentage)
    await set(minPiggyBankValue)
    await set(maxPiggyBankExpense)
}

function get(key) {
    // Immediately return a promise and start asynchronous work
    return new Promise((resolve) => {
        // Asynchronously call
        chrome.storage.local.get(key, (items) => {
            resolve(items[key])
        })
    })
}

function set(object) {
    return new Promise((resolve) => chrome.storage.local.set(object, () => resolve()))
}