var storedObj = browser.storage.local.get([
    "apiKey",
    "minProfit",
    "minPercentage",
    "minPiggyBankValue",
    "maxPiggyBankExpense"
])
storedObj.then(setInititalValues)

function setInititalValues(values) {
    if (!values.apiKey || values.apiKey === "") {
        console.log("no api key")
        // TODO handle case
    } else {
        document.querySelector("#apikey").value = values.apiKey
    }

    if (values.minProfit) document.querySelector("#minProfit").value = values.minProfit
    if (values.minPercentage) document.querySelector("#minPercentage").value = values.minPercentage
    if (values.minPiggyBankValue) document.querySelector("#minPiggyBankValue").value = values.minPiggyBankValue
    if (values.maxPiggyBankExpense) document.querySelector("#maxPiggyBankExpense").value = values.maxPiggyBankExpense
}

document.querySelector("#apikeybtn").addEventListener("click", setApiKey)
document.querySelector("#valuesbtn").addEventListener("click", setConfigValues)

function setApiKey() {
    console.log("setApiKey")
    var apiKey = document.querySelector("#apikey").value
    if (apiKey == "") {
        // invalid
    }
    console.log(`[TM+] api key: ${apiKey}`)
    browser.storage.local.set({apiKey})
}

function setConfigValues() {
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
    browser.storage.local.set({
        minProfit,
        minPercentage,
        minPiggyBankValue,
        maxPiggyBankExpense
    })
}