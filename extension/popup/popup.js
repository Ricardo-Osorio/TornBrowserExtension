setInitialValues()

document.querySelector("#apikeybtn").addEventListener("click", setApiKey)
document.querySelector("#valuesbtn").addEventListener("click", setConfigValues)

async function setInitialValues() {
    let apiKey = await get("apiKey")
    let minProfit = await get("minProfit")
    let minPercentage = await get("minPercentage")
    let minPiggyBankValue = await get("minPiggyBankValue")
    let maxPiggyBankExpense = await get("maxPiggyBankExpense")

    if (!apiKey || apiKey === "") {
        console.log("[TM+] API key not found!")
        // TODO handle case
    } else {
        document.querySelector("#apikey").value = apiKey
    }

    if (minProfit) document.querySelector("#minProfit").value = minProfit
    if (minPercentage) document.querySelector("#minPercentage").value = minPercentage
    if (minPiggyBankValue) document.querySelector("#minPiggyBankValue").value = minPiggyBankValue
    if (maxPiggyBankExpense) document.querySelector("#maxPiggyBankExpense").value = maxPiggyBankExpense

    // console.log(`[TM+] opened popup with apiKey: ${apiKey}, min profit: ${minProfit}, min percentage: ${minPercentage}, min piggy bank ${minPiggyBankValue}, max piggy bank expense: ${maxPiggyBankExpense}`)
}

function setApiKey() {
    let apiKey = document.querySelector("#apikey").value
    if (apiKey == "") {
        // invalid
    }
    set({apiKey})
    
    console.log(`[TM+] API key stored!`)
}

function setConfigValues() {
    let minProfit = document.querySelector("#minProfit").value
    if (minProfit == "" || minProfit < 1) {
        // invalid
    }

    let minPercentage = document.querySelector("#minPercentage").value
    if (minPercentage == "" || minPercentage < 1) {
        // invalid
    }

    let minPiggyBankValue = document.querySelector("#minPiggyBankValue").value
    if (minPiggyBankValue == "" || minPiggyBankValue < 1) {
        // invalid
    }

    let maxPiggyBankExpense = document.querySelector("#maxPiggyBankExpense").value
    if (maxPiggyBankExpense == "" || maxPiggyBankExpense < 1) {
        // invalid
    }

    set({minProfit})
    set({minPercentage})
    set({minPiggyBankValue})
    set({maxPiggyBankExpense})
    
    // console.log(`[TM+] updated values: min profit: ${minProfit}, min percentage: ${minPercentage}, min piggy bank ${minPiggyBankValue}, max piggy bank expense: ${maxPiggyBankExpense}`)
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