# Torn extension (early development)

Browser extension for the game [Torn.com](www.torn.com) focused on improving the market experience!

Product in early stages of development and it will continue for as long as I am enjoying and playing the game but anyone is free to contribute or make it their own! :)

<a target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/tornmarket/">
    <img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" alt="extension-redirect" width="140" height="65" />
</a>

## Overview

Having a player driven economy, products can be found selling at a wide range of prices every day, some people have the patient to wait for a seller willing to offer what they are asking for while others just want to make a quick buck and don't care about a smaller margin... Sometimes you even find products selling for a lower price than what the NPC stores offer for it!

It's possible to manually check the price for each item at a time but the process is tedious and time consuming, hence why I have transformed pages like the market to look like:

<p align="center">
    <img src="https://user-images.githubusercontent.com/26963810/157340349-19d7a3bf-2f23-47ad-a9c0-627bf960d21e.png" alt="preview-market-pages-changes" width="700" height="481" />
</p>

## Features

This extensions adds the following extra information to the pages:
- Market
    - **Items on sale** - displays an icon with how much cheaper (%) an item is compared to its current market price

        *This is only turned on for a set number of categories*
    - **Reselling profit** - shows exactly how much profit can be made by buying and selling an item in the NPC stores OR on the market again at the current market price
    *The latter in only turned on for a set number of categories and has a red color*
    - **Store money in items** - adds a small piggy bank icon to items selling for the same amount as they can be sold to NPC stores, useful to store money in items and knowing you can get it back safely
- Bazaar
    - **Items on sale** - displays an icon with how much cheaper (%) an item is compared to its current market price
    
        *This is turned on for all categories in bazaars due to the lack of categories on this page*
    - **Reselling profit** - shows exactly how much profit can be made by buying and selling an item in the NPC stores. Items are also highlighted
    - **Store money in items** - adds a small piggy bank icon to items selling for the same amount as they can be sold to NPC stores, useful to store money in items and knowing you can get it back safely

On the above pages and the NPC stores there will be a side bar added to the browser allowing for quickly moving around between the market pages. On top of that, one of the buttons takes you back to the last bazaar you visited.

## Customization
There's a browser popup to set the API key and customize parameters to your liking.
- **Minimum profit** - Minimum profit amount needed before displaying the highlight and profit on items
- **Minimum sale (%)** - Minimum profit percentage needed before displaying the highlight and icon on items
- **Minimum piggy bank value** - Minimum value necessary to consider an item worth of buying to store money
- **Maximum piggy bank expense** - Maximum value an item can be above reselling price to still consider it worth of buying to store money

All these settings allow to filter out "false positives" like cheap items with market value so low that even thought the item may be selling for lower than its market price and can be used to generate profit/store money, it's such a small amount that makes it not worth the effort and clutter on screen (icons and values).

## API Key
All that is needed is a basic user API key with no permissions whatsoever! This is used to request the list of items and their prices (public information). No account data is ever needed.

## Number of requests
Prices and items are updated once every minute, thus making one API request every minute keeping it within the limit of 100 requests a minute per account.

## Features to consider
- Test hiding the sidebar almost completely and show it on mouse hover.
- Add a setting for the sidebar to not be shown at all.
- For items selling at less than $5 should be displayed with a different color for the "discount" background image (something that clearly calls the attention) in place of the current red one.
- Try to update manifest to load scripts with "document_idle" instead of "document_end" as that could lead to removing some "await requireElement"s
- On the market page, when there's a profit to be made by either reselling to the NPC stores or market again, shows the two values side by side and perhaps different color/icon
- Show market resell profit on the bazaar pages the same way it is shown on the market pages.

## Known bugs to fix
- On a bazaar, pressing the "buy" on an item that is highlighted but then aborting and closing that small "buy" window will restore the object to the original form without any price highlights or profit elements, basically resetting it.
- On the market page, after buying an item with highlights from the "quick buy" option (not opening a bazaar) and closing the window, the highlights are not removed.
It would be nice to handle this case even thought its expected due to nothing ever actually changing on that page.
- I am seeing wrong discount percentages from time to time on random items. The background process keeping prices up to data could be seeing some sort of issue. Needs investigating.

## Boring section
Below are some limitation I found when working on the project and how I deal with them:
- Many pages in Torn rely on URL fragments/sections (#/p=market) as opposed to queries (?q=market). Unfortunately browser extensions when matching the pages URL to the ones in the manifest file are limited on those cases and as such comes the need for an ugly hack like the one in the background.js.
There, it listens for all requests, looks at the URL and decides which content script to trigger.
