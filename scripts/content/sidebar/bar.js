"use strict"

// builds the URL to fetch the icons. supports as input:
// candy, car, market, refresh, rifle and tools
function getIconURL(name) {
    return browser.extension.getURL("resources/icons/"+name+"-icon.png");  
}

var body = document.querySelector("#body")

// sidebar div
const bar = document.createElement("div")
bar.classList.add("sidebar-fixed")

// refresh button
if (typeof showHighlight !== 'undefined') {
    var button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = showHighlight // could do with a forced option?
    
    var tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Refresh highlights"))
    button.appendChild(tooltip)

    var icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("refresh"))
    icon.classList.add("tmm-img")
    button.appendChild(icon)

    bar.appendChild(button)
}

// Market button
if (window.location.href !== "https://www.torn.com/imarket.php") {
    var button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/imarket.php"
    }

    var tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Market"))
    button.appendChild(tooltip)

    var icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("market"))
    icon.classList.add("tmm-img")
    button.appendChild(icon)

    bar.appendChild(button)
}


// Docks button
if (window.location.href !== "https://www.torn.com/shops.php?step=docks") {
    var button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/shops.php?step=docks"
    }

    var tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Docks"))
    button.appendChild(tooltip)

    var icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("car"))
    icon.classList.add("tmm-img")
    button.appendChild(icon)

    bar.appendChild(button)
}

// Guns shop button
if (window.location.href !== "https://www.torn.com/bigalgunshop.php") {
    var button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/bigalgunshop.php"
    }

    var tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Big Al's Gun Shop"))
    button.appendChild(tooltip)

    var icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("rifle"))
    icon.classList.add("tmm-img")
    button.appendChild(icon)

    bar.appendChild(button)
}

// Bits&Bobs shop button
if (window.location.href !== "https://www.torn.com/shops.php?step=bitsnbobs") {
    var button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/shops.php?step=bitsnbobs"
    }

    var tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Bits 'n' Bobs"))
    button.appendChild(tooltip)

    var icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("tools"))
    icon.classList.add("tmm-img")
    bar.appendChild(icon)
    button.appendChild(icon)

    bar.appendChild(button)
}

// Candy shop button
if (window.location.href !== "https://www.torn.com/shops.php?step=candy") {
    var button = document.createElement("button")
    button.classList.add("tooltip")
    button.onclick = function () {
        window.location.href = "https://www.torn.com/shops.php?step=candy"
    }

    var tooltip = document.createElement("span")
    tooltip.classList.add("tooltiptext")
    tooltip.appendChild(document.createTextNode("Sally's Sweet Shop"))
    button.appendChild(tooltip)

    var icon = document.createElement("img");
    icon.setAttribute("src", getIconURL("candy"))
    icon.classList.add("tmm-img")
    bar.appendChild(icon)
    button.appendChild(icon)

    bar.appendChild(button)
}

body.appendChild(bar)

console.log("[TMM] side bar loaded")