# Torn extension (early development)

Browser extension for the game [Torn.com](www.torn.com) focused on improving the market experience!

Product in early stages of development and I will continue working on it for as long as I am enjoying and playing the game but anyone is free to contribute or make it their own! :)

<a target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/tornmarket/">
    <img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" alt="extension-redirect" width="140" height="65" />
</a>

## Overview

Having a player driven economy, products can be found selling at a wide range of prices every day, so finding the best prices is no easy task.

Hence why I have transformed pages like the market to give you all the information you need:

<p align="center">
    <img src="https://user-images.githubusercontent.com/26963810/157340349-19d7a3bf-2f23-47ad-a9c0-627bf960d21e.png" alt="preview-market-pages-changes" width="700" height="481" />
</p>

## Features

You will now immediately see:

- **Items on sale** - displays an icon with how much cheaper (%) an item is compared to its current market price.

    *Currently, this is only turned on for a set number of categories*

- **Reselling profit** - shows exactly how much profit can be made by buying and selling an item in the NPC stores OR on the market again at the current market price.

    *The latter in only turned on for a set number of categories*

- **Items useful to store money** - adds a small piggy bank icon to items selling for the same amount as they can be sold to NPC stores, useful to store money in items knowing you can get it back safely.

Updating the price of an item listed on the market will repeat that action for all of the same items on the page.

Also add a sidebar to help navigate between stores (market, NPC, last visited bazaar, ...) with one click.

## Customization

The browser popup is used to set the API key (required) and customize parameters to your liking:
- **Minimum profit** - Minimum profit amount to display the highlight and profit on items
- **Minimum sale (%)** - Minimum profit percentage to display the highlight and icon on items
- **Minimum piggy bank value** - Minimum value to consider an item worth of buying to store away money
- **Maximum piggy bank expense** - How much more expensive can items be above reselling price to still consider it worth of buying to store away money

## API Key
All that is needed is a basic user API key with no permissions whatsoever! This is used to request the list of items and their prices (public information). No account data is ever needed.

## Number of requests
Prices and items are updated once every minute, thus making one API request every minute keeping it within the limit of 100 requests a minute per account.

## Features to consider
- Option to hide the sidebar completely.
- Items selling at less than $5 should be displayed with a different color for the "discount" background image (something that clearly calls the attention) in place of the current red one.
- Try to update manifest to load scripts with "document_idle" instead of "document_end" as that could lead to removing some "await requireElement"s
- On the market page, when there's a profit to be made by either reselling to the NPC stores or market again, shows the two values side by side and perhaps different color/icon
- Show market resell profit on the bazaar pages the same way it is shown on the market pages.

## Boring section
Below are some limitation I found when working on the project and how I deal with them:
- Many pages in Torn rely on URL fragments/sections (#/p=market) as opposed to queries (?q=market). Unfortunately browser extensions when matching the pages URL to the ones in the manifest file are limited on those cases and as such comes the need for an ugly hack like the one in the background.js.
There, it listens for all requests, looks at the URL and decides which content script to trigger.