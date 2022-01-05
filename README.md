Bugs:
    - On a bazaar, filtering by a keyword will show a list of items where none have the highlight. Removing the filter will then show the entire list again which now includes the highlights.
    - Bazaar ordering buttons won't cause the script to trigger (still happening)
    - From the market, opening an item to buy, buying all cheap items from that list and then closing it will not trigger an update (XMLHttpRequest are being blocked so these are blocked as well?) - see if there's any difference to them since one is probably a POST and the other a GET

Features:
    - Menu somewhere that stays over other elements in the page with options:
        - Link to previous bazaar opened (making the process of going back and forward easier if we don't currently have the money to buy all the under prices items)
        - Able to hide the sidebar and how on hover maybe?
    - Clicking the buy from the market page will open a list of bazaar/people. This could have some sort of highlight to help find the one that is cheapest
    - Add a blacklist bazaar list that somehow highlights them with a red cross or lock and prevents me from losing time with those
    - Items that are selling for the same price as they sell are good to store money (without risking being mugged) so those could use an icon to easily spot them (a chest?)
    - A visual hint when there's not enough money to buy something, both on the market and bazaar
    - Able to define a desired profit point at which it will highlight items differently, for example Profit > $1000
    - Show the total amount of money that can be made if the person were to buy/sell all items in a page. Show this on the top bar next to the "search" input field. That way, on pages that are long to scroll down (or to be lazy) it's easier to spot this.