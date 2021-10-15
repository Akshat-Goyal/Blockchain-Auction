# Tests

> The following are some sample tests. A lot of checking has been done everywhere to make sure that only the authorised users can execute key functions

### Test 1

- Import four accounts to MetaMask using Ganache
- The first account makes a listing for an item using an Average Priced Auction
- The other three accounts bid 1000, 2000, and 3000 respectively
- The seller stops the bidding
- All the other 3 bidders pay their amounts
- The seller stops the auction
- The seller delivers the secret string to the user who bid 2000
- The other bidders get their refund automatically
- The winner gets his secret string and it can be seen in his cart.

P.S. Try this for all the three types of auctions and notice the difference in the winner in each case.


### Test 2

- Import a few accounts to MetaMask using Ganache.
- We will test the fixed price feature from Assignment 1
- Try any of the tests in the `tests.md` file submitted in Assignment 1 OR just make a listing using 1 account and buy from the other account. Then seller will deliver the secret string and buyer can check the secret string in his cart.

### Test 3

- Import a few accounts to MetaMask using Ganache.
- A seller lists an item for Second Priced Auction
- Only 1 buyer bids for it
- The seller stops the bidding after some time
- The bidder pays the amount he/she bid.
- The seller stops the auction and delivers the secret string to the only bidder
- Since there was only 1 bid, the second highest price is 0, and hence the amount bid is fully refunded to the buyer and he effectively gets the item for free other than the gas fee.

### Test 4

Let's check some error handling in this test!

- Import a few accounts to MetaMask using Ganache.
- Try to list a fixed price item for a negative price.

BOOM!! Error. An alert will pop up :)
- List an item for any type of auction.
- Change account and try to bid a negative amount for that item.

BOOM!! Error. An alert will pop up :)

Note that a seller is allowed to list an item for a price of 0. Also, note that a buyer is allowed to a place a bid of 0. This is intentional.
