setInitialValues()

document.querySelector("#apikeybtn").addEventListener("click", SetApiKey)
document.querySelector("#valuesbtn").addEventListener("click", SetConfigValues)
document.querySelector("#settingsbtn").addEventListener("click", UpdateCategorySettings)

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active")
    var content = this.nextElementSibling
    if (content.style.display === "block") {
      content.style.display = "none"
    } else {
      content.style.display = "block"
    }
  })
} 

async function setInitialValues() {
    let apiKey = await get("apiKey")
    let minProfit = await get("minProfit")
    let minPercentage = await get("minPercentage")
    let minPiggyBankValue = await get("minPiggyBankValue")
    let maxPiggyBankExpense = await get("maxPiggyBankExpense")

    let categorySettingsObj = await get("categorySettingsObj")
    if (typeof categorySettingsObj !== 'undefined') {
        let categorySettings = new Map(Object.entries(categorySettingsObj))
        if (categorySettings.size !== 0) {
            RestoreCategorySettings(categorySettings)
        }
    } else {
        // default values
        let categorySettings = new Map()
        categorySettings.set("Melee", {shop: true, market: false, sale: false})
        categorySettings.set("Primary", {shop: true, market: false, sale: false})
        categorySettings.set("Secondary", {shop: true, market: false, sale: false})
        categorySettings.set("Defensive", {shop: true, market: false, sale: false})
        categorySettings.set("Medical", {shop: true, market: true, sale: false})
        categorySettings.set("Temporary", {shop: true, market: false, sale: false})
        categorySettings.set("Energy Drink", {shop: true, market: true, sale: false})
        categorySettings.set("Candy", {shop: true, market: true, sale: false})
        categorySettings.set("Drug", {shop: true, market: true, sale: false})
        categorySettings.set("Enhancer", {shop: true, market: false, sale: false})
        categorySettings.set("Alcohol", {shop: true, market: true, sale: false})
        categorySettings.set("Booster", {shop: true, market: false, sale: false})
        categorySettings.set("Electronic", {shop: true, market: false, sale: false})
        categorySettings.set("Jewelry", {shop: true, market: false, sale: false})
        categorySettings.set("Virus", {shop: true, market: false, sale: false})
        categorySettings.set("Flower", {shop: true, market: true, sale: false})
        categorySettings.set("Supply Pack", {shop: true, market: false, sale: false})
        categorySettings.set("Collectible", {shop: true, market: false, sale: false})
        categorySettings.set("Clothing", {shop: true, market: false, sale: false})
        categorySettings.set("Car", {shop: true, market: false, sale: false})
        categorySettings.set("Artifact", {shop: true, market: false, sale: false})
        categorySettings.set("Plushie", {shop: true, market: true, sale: false})
        categorySettings.set("Special", {shop: true, market: false, sale: false})
        categorySettings.set("Other", {shop: true, market: false, sale: false})
        RestoreCategorySettings(categorySettings)
    }

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

function SetApiKey() {
    let apiKey = document.querySelector("#apikey").value
    if (apiKey == "") {
        // invalid
    }
    set({apiKey})
    
    console.log(`[TM+] API key stored!`)
}

function SetConfigValues() {
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

function RestoreCategorySettings(categorySettings) {
    let checkboxes = document.getElementsByName("resell_shops_option")
    for(let i = 0; i < checkboxes.length; i++) {
        let setting = categorySettings.get(checkboxes[i].value)
        if (setting.shop) checkboxes[i].checked = true
    }

    checkboxes = document.getElementsByName("resell_market_option")
    for(let i = 0; i < checkboxes.length; i++) {
        let setting = categorySettings.get(checkboxes[i].value)
        if (setting.market) checkboxes[i].checked = true
    }

    checkboxes = document.getElementsByName("sale_option")
    for(let i = 0; i < checkboxes.length; i++) {
        let setting = categorySettings.get(checkboxes[i].value)
        if (setting.sale) checkboxes[i].checked = true
    }
}

function UpdateCategorySettings() {
    // build map from category into {npc,market} obj representing intention
    let categorySettings = new Map()

    let checkboxes = document.getElementsByName("resell_shops_option")
    for(let i = 0; i < checkboxes.length; i++) {
        let setting = {shop: checkboxes[i].checked}
        categorySettings.set(checkboxes[i].value, setting)
    }

    checkboxes = document.getElementsByName("resell_market_option")
    for(let i = 0; i < checkboxes.length; i++) {
        let setting = categorySettings.get(checkboxes[i].value)
        setting.market = checkboxes[i].checked
        categorySettings.set(checkboxes[i].value, setting)
    }

    checkboxes = document.getElementsByName("sale_option")
    for(let i = 0; i < checkboxes.length; i++) {
        let setting = categorySettings.get(checkboxes[i].value)
        setting.sale = checkboxes[i].checked
        categorySettings.set(checkboxes[i].value, setting)
    }

    categorySettingsObj = Object.fromEntries(categorySettings)
    set({categorySettingsObj})
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