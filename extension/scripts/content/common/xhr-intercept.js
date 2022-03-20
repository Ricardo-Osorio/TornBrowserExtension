"use strict";

(() => {
	listenForXHR()
})()

function listenForXHR() {
	const originalXHROpen = window.XMLHttpRequest.prototype.open

	window.XMLHttpRequest.prototype.open = function (method, url) {
		this.addEventListener("readystatechange", function () {
			if (this.readyState > 3 && this.status === 200) {
				const page = this.responseURL.substring(this.responseURL.indexOf("torn.com/") + "torn.com/".length, this.responseURL.indexOf(".php"))

				if (page === 'imarket' && method === 'POST') {
					console.log(`[TM+] intercepted XHR request on imarket page, refreshing highlights`)
					window.dispatchEvent(
						new Event("trigger-highlight")
					)
				}
			}
		})

		return originalXHROpen.apply(this, arguments)
	}
}