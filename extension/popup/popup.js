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
        categorySettings.set("Melee", {npc: true, market: false})
        categorySettings.set("Primary", {npc: true, market: false})
        categorySettings.set("Secondary", {npc: true, market: false})
        categorySettings.set("Defensive", {npc: true, market: false})
        categorySettings.set("Medical", {npc: true, market: true})
        categorySettings.set("Temporary", {npc: true, market: false})
        categorySettings.set("Energy", {npc: true, market: true})
        categorySettings.set("Candy", {npc: true, market: true})
        categorySettings.set("Drug", {npc: true, market: true})
        categorySettings.set("Enhancer", {npc: true, market: false})
        categorySettings.set("Alcohol", {npc: true, market: true})
        categorySettings.set("Booster", {npc: true, market: false})
        categorySettings.set("Electronic", {npc: true, market: false})
        categorySettings.set("Jewelry", {npc: true, market: false})
        categorySettings.set("Virus", {npc: true, market: false})
        categorySettings.set("Flower", {npc: true, market: true})
        categorySettings.set("Supply Pack", {npc: true, market: false})
        categorySettings.set("Collectible", {npc: true, market: false})
        categorySettings.set("Clothing", {npc: true, market: false})
        categorySettings.set("Car", {npc: true, market: false})
        categorySettings.set("Artifact", {npc: true, market: false})
        categorySettings.set("Plushie", {npc: true, market: true})
        categorySettings.set("Special", {npc: true, market: false})
        categorySettings.set("Other", {npc: true, market: false})
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
    let checkboxes = document.getElementsByName("resell_npc_option")
    for(let i = 0; i < checkboxes.length; i++) {
        let categorySetting = categorySettings.get(checkboxes[i].value)
        if (categorySetting.npc) checkboxes[i].checked = true
    }

    checkboxes = document.getElementsByName("resell_market_option")
    for(let i = 0; i < checkboxes.length; i++) {
        let categorySetting = categorySettings.get(checkboxes[i].value)
        if (categorySetting.market) checkboxes[i].checked = true
    }
}

function UpdateCategorySettings() {
    // build map from category into {npc,market} obj representing intention
    let categorySettings = new Map()

    let checkboxes = document.getElementsByName("resell_npc_option")
    for(let i = 0; i < checkboxes.length; i++) {
        let categorySetting = {npc: checkboxes[i].checked}
        categorySettings.set(checkboxes[i].value, categorySetting)
    }

    checkboxes = document.getElementsByName("resell_market_option")
    for(let i = 0; i < checkboxes.length; i++) {
        let categorySetting = categorySettings.get(checkboxes[i].value)
        categorySetting.market = checkboxes[i].checked
        categorySettings.set(checkboxes[i].value, categorySetting)
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