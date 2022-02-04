Bugs:
    - The sidebar is currently being added multiple times whenever the script is loaded (at the moment it's only on manual reload but this should be prevented anyways)
    - On a bazaar, pressing the "buy" on an item that is highlighted but then aborting and closing that small "buy" window will restore the object to the original form without a price (profile element)
    - On the listings page, when the user adds a new item it also triggers the script?
    - Bazaar items with the price set to $1 and that are locked (only sellable to one person?) still show the highlight on them
    - On the market even after buying an item a low price and closing the window, it still shows the "sale" and "profit elements. If possible it would be nice if these could be removed.
    - Bazaar discounts are shown for every category since categories are not available there. However if I store those within the apiItem objects I may be able to still follow that rule.
    The sale percentage on bazaars is being wrongly calculated? Here https://www.torn.com/bazaar.php?userId=322162#/ the Blowguns are at 99% off? Later node on this: This has happened a few times and it's due to the data stored locally from the API somehow ending up with wrong values, refreshing that data fixes it. Also I only noticed this hapenning with Blowguns for some reason...

Features:
    - Menu that stays over other elements in the page with options:
        - Able to hide the sidebar and show it on mouse hover?
        - Add an option to go back to the last visited bazaar
    - Clicking the buy from the market page will open a list of bazaar/people. This could have some sort of highlight to help find the one that is cheapest
    - Add a blacklist bazaar list that somehow highlights them with a red cross or lock and prevents me from losing time with those
    - For items selling at < $5 show a different color "discount" background image (something that clearly calls the attention) in place of the typical red one
    - Try to update manifest to load scripts with "document_idle" instead of "document_end" as that means the page as loaded everything and thus may be able to remove some "await requireElement"s
    - Listings page, able to remove all listings of an item
    - On the market page, show two values, one when I can make a profit by selling it to NPC store (icon would be a tag - same as when selling from the items page) and when reselling in the market (based on current market price) - icon would be a refresh/recycle icon. Both values can exist on the same div?

Try to do:
    - On the listings page try to handle clicks with this approach:
    ```
    document.addEventListener("click", (e) => {
        e.target.textContent // see what I have available here
        // could use this instead of adding the event listener to each button loading the page
    }
    ```

Things to consider keeping in the readme:
    - Many pages in Torn rely on URL fragments/section (#) as oposed to queries. Unfortunatly browser extensions matching capabilities are limited on those cases and as such comes the need for an ugly hack like the one in the background.js