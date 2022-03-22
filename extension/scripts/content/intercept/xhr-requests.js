"use strict";

(() => {
	const originalXHROpen = window.XMLHttpRequest.prototype.open

	window.XMLHttpRequest.prototype.open = function (method, url) {
		this.addEventListener("readystatechange", function () {
			if (method === 'POST' && this.readyState > 3 && this.status === 200) {
				// listing page, update item:
				// this.requestBody = step=changePrice&ID=146866501&price=551
				// ID is not of the item but the listing itself

				// market, change category:
				// this.requestBody = step=getItems&type=Temporary

				let requestBodyParams = this.requestBody.split("&")
				switch(requestBodyParams[0].split("=")[1]) {
					case "changePrice":
						console.log("[TM+] intercepted XHR request on listings page")
						let itemID = requestBodyParams[1].split("=")[1]
						let price = requestBodyParams[2].split("=")[1]
						window.dispatchEvent(
							new CustomEvent("update-listing-price", {
								detail: {
									price: price,
								}
							})
						)
						break

					case "getItems":
						console.log("[TM+] intercepted XHR request on market page")
						window.dispatchEvent(
							new Event("refresh-market-highlight")
						)
						break

					default:
						return
				}
			}
		})

		return originalXHROpen.apply(this, arguments)
	}
})()