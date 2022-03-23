build-firefox:
	cp manifests/firefox-manifest.json extension/manifest.json

build-chrome:
	cp manifests/chrome-manifest.json extension/manifest.json

zip-chrome: build-chrome
	zip -r torn-market-plus.zip extension/*