build-firefox:
	cp manifests/firefox-manifest.json extension/manifest.json

build-chrome:
	cp manifests/chrome-manifest.json extension/manifest.json

zip-firefox: build-firefox
	zip -r torn-market-plus.zip extension/*

zip-chrome: build-chrome
	zip -r torn-market-plus.zip extension/*