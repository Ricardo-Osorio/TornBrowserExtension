"use strict"

console.log("[TM+] loading sidebar")

let body = document.querySelector("#body")

// sidebar div
const bar = document.createElement("div")
bar.classList.add("sidebar-fixed")

// refresh button
// the content script that defines the "showHighlight" is only loaded
// with the bazarr and market pages and that's when we need this btn
if (typeof showHighlight !== 'undefined') {
    let button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = async function() {
        refreshIcon.classList.add("tmm-spinner")
        await showHighlight() // could do with a forced option?
        refreshIcon.classList.remove("tmm-spinner")
    }
    
    let tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Refresh highlights"))
    button.appendChild(tooltip)

    let refreshIcon = document.createElement("img");
    refreshIcon.setAttribute("src", getIconURL("refresh"))
    refreshIcon.classList.add("tmm-img")
    button.appendChild(refreshIcon)

    bar.appendChild(button)
}

// Market button
if (window.location.href !== "https://www.torn.com/imarket.php") {
    let button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/imarket.php"
    }

    let tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Market"))
    button.appendChild(tooltip)

    let icon = document.createElement("img")
    icon.setAttribute("src", getIconURL("market"))
    icon.classList.add("tmm-img")
    button.appendChild(icon)

    bar.appendChild(button)
}


// Docks button
if (window.location.href !== "https://www.torn.com/shops.php?step=docks") {
    let button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/shops.php?step=docks"
    }

    let tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Docks"))
    button.appendChild(tooltip)

    let icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("car"))
    icon.classList.add("tmm-img")
    button.appendChild(icon)

    bar.appendChild(button)
}

// Guns shop button
if (window.location.href !== "https://www.torn.com/bigalgunshop.php") {
    let button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/bigalgunshop.php"
    }

    let tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Big Al's Gun Shop"))
    button.appendChild(tooltip)

    let icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("rifle"))
    icon.classList.add("tmm-img")
    button.appendChild(icon)

    bar.appendChild(button)
}

// Bits&Bobs shop button
if (window.location.href !== "https://www.torn.com/shops.php?step=bitsnbobs") {
    let button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/shops.php?step=bitsnbobs"
    }

    let tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Bits 'n' Bobs"))
    button.appendChild(tooltip)

    let icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("tools"))
    icon.classList.add("tmm-img")
    bar.appendChild(icon)
    button.appendChild(icon)

    bar.appendChild(button)
}

// Candy shop button
if (window.location.href !== "https://www.torn.com/shops.php?step=candy") {
    let button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/shops.php?step=candy"
    }

    let tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Sally's Sweet Shop"))
    button.appendChild(tooltip)

    let icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("candy"))
    icon.classList.add("tmm-img")
    button.appendChild(icon)

    bar.appendChild(button)
}

// Super store button
if (window.location.href !== "https://www.torn.com/shops.php?step=super") {
    let button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/shops.php?step=super"
    }

    let tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Super Store"))
    button.appendChild(tooltip)

    let icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("super-store"))
    icon.classList.add("tmm-img")
    button.appendChild(icon)

    bar.appendChild(button)
}

// Clothing store button
if (window.location.href !== "https://www.torn.com/shops.php?step=clothes") {
    let button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/shops.php?step=clothes"
    }

    let tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("TC Clothing"))
    button.appendChild(tooltip)

    let icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("shirt"))
    icon.classList.add("tmm-img")
    button.appendChild(icon)

    bar.appendChild(button)
}

// Last bazaar visited button
GetLastBazaarVisitedBtn()
async function GetLastBazaarVisitedBtn() {
    let lastBazaar = await get("lastBazaar")
    if (lastBazaar && window.location.href !== lastBazaar) {
        let button = document.createElement("button")
        button.classList.add("tooltip")
        button.onclick = function () {
            window.location.href = lastBazaar
        }

        let tooltip = document.createElement("span")
        tooltip.classList.add("tooltiptext")
        tooltip.appendChild(document.createTextNode("Last bazaar visited"))
        button.appendChild(tooltip)

        let icon = document.createElement("img");
        icon.setAttribute("src", getIconURL("last-bazaar"))
        icon.classList.add("tmm-img")
        button.appendChild(icon)

        bar.appendChild(button)
    }
}


body.appendChild(bar)

console.log("[TM+] side bar loaded")