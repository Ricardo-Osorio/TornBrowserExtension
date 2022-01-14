Bugs:
    - The sidebar is currently being added multiple times whenever the script is loaded (at the moment it's only on manual reload but this should be prevented anyways)
    - On a bazaar, pressing the "buy" on an item that is highlighted but then aborting and closing that small "buy" window will restore the object to the original form without a price (profile element)
    - On the listings page, when adding a new one it also triggers the script?

Features:
    - Menu somewhere that stays over other elements in the page with options:
        - Link to previous bazaar opened (making the process of going back and forward easier if we don't currently have the money to buy all the under prices items)
        - Able to hide the sidebar and how on hover maybe?
    - Clicking the buy from the market page will open a list of bazaar/people. This could have some sort of highlight to help find the one that is cheapest
    - Add a blacklist bazaar list that somehow highlights them with a red cross or lock and prevents me from losing time with those
    - Items that are selling for the same price as they sell (or very close) are good to store money (without risking being mugged) so those could use an icon to easily spot them (a chest?)
    - A visual hint when there's not enough money to buy something, both on the market and bazaar
    - Able to define a desired profit point at which it will highlight items differently, for example Profit > $1000. Some items may be on a good discount for their usual price but that discount be only worth $50 for example.
    - Show the total amount of money that can be made if the person were to buy/sell all items in a page. Show this on the top bar next to the "search" input field. That way, on pages that are long to scroll down it's easier to spot this.
    - TODO checkboxes. These can be daily or not. if daily it resets the next day when it's loaded. This would help with achievements like "pray at church"
    - Automatically change the price of all listings of an item already on the item market. Example: there's tons of an item at 100 and I want to change all listings to 90 or 110 without manually updating each single one.
    - For items selling at < $5 show a golden icon (something that clearly calls the attention) in place of the typical discount percentage - the amount can still be shown I guess?
    - Try to update manifest to load scripts with "document_idle" instead of "document_end" as that means the page as loaded everything and thus may be able to remove some "await requireElement"s

Things to consider keeping in the readme:
    - Many pages in Torn rely on URL fragments/section (#) as oposed to queries. Unfortunatly browser extensions matching capabilities are limited on those cases and as such comes the need for an ugly hack like the one in the background.js