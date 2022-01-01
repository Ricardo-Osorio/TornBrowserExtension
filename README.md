Bugs:
    - Fix the multiple calls to the market script (from the background one)
    - On a bazaar, filtering by a keyword will show a list of items where none have the highlight. Removing the filter will then show the entire list again which now includes the highlights.
    - Bazaar ordering won't cause the script to trigger (still happening)
    - From the market, opening an item to buy, buying all cheap items from that list and then closing it will not trigger an update (check again, could be fixed with a recent change)

Features:
    - Menu somewhere that stays over other elements in the page with options:
        - Link to previous bazaar opened (making the process of going back and forward easier if we don't currently have the money to buy all the under prices items)
        - Able to hide it? lowest priority for this
    - Clicking the buy from the market page will open a list of bazaar/people. This should have some sort of highlight to help find the one that is cheapest
    - Add a blacklist bazaar list that somehow highlights and prevents me from losing time with those
    - Items that are selling for the same price as they sell are good to store money (without risking being mugged) so those could use an icon to easily spot them (a chest?)
    - A visual hint when there's not enough money to buy something, either on the market or bazaar...
    - Able to define the desired profit point at which it will highlight items