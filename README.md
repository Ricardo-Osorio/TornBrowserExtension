Bugs:
    - The sidebar is currently being added multiple times whenever the script is loaded (at the moment it's only on manual reload but this should be prevented anyways)
    - On a bazaar, pressing the "buy" on an item that is highlighted but then aborting and closing that small "buy" window will restore the object to the original form without a price (profile element)
    - On the listings page, when the user adds a new item it also triggers the script?
    - Bazaar items with the price set to $1 and that are locked (only sellable to one person?) still show the highlight on them
    - On the market even after buying an item a low price and closing the window, it still shows the "sale" and "profit elements. If possible it would be nice if these could be removed.
    - Bazaar discounts are shown for every category since categories are not available there. However if I store those within the apiItem objects I may be able to still follow that rule.

Features:
    - Menu that stays over other elements in the page with options:
        - Able to hide the sidebar and how on hover?
    - Clicking the buy from the market page will open a list of bazaar/people. This could have some sort of highlight to help find the one that is cheapest
    - Add a blacklist bazaar list that somehow highlights them with a red cross or lock and prevents me from losing time with those
    - TODO checkboxes. These can be daily or not. if daily it resets the next day when it's loaded. This would help with achievements like "pray at church"
    - For items selling at < $5 show a different color "discount" background image (something that clearly calls the attention) in place of the typical red one
    - Try to update manifest to load scripts with "document_idle" instead of "document_end" as that means the page as loaded everything and thus may be able to remove some "await requireElement"s
    - Store the timestamp when an API request was made and if the time since that timestamps is > 1 min then make another request, otherwise use the existing one

Things to consider keeping in the readme:
    - Many pages in Torn rely on URL fragments/section (#) as oposed to queries. Unfortunatly browser extensions matching capabilities are limited on those cases and as such comes the need for an ugly hack like the one in the background.js