// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title A Modern Way
 * @dev Smart contract to facilitate buying, selling, auction of items securely
 */
contract AModernWay {
    /**
     * This is an enum which will help to keep the current status of an item.
     * The status FOR_AUCTION signifies that the buyers can bid at auction to buy the item
     * The status FOR_SALE signifies that the buyers can buy the item at the price specified by the seller
     * The status PAY_AND_VERIFY signifies that the bidders can pay to verify their bid
     * The status SOLD signifies that the item is sold to the buyer
     * The status DELIVERED signifies that the item is delivered to the buyer
     */
    enum status {
        FOR_AUCTION,
        FOR_SALE,
        PAY_AND_VERIFY,
        SOLD,
        DELIVERED,
        NO_BIDS
    }

    enum AuctionType {
        FIRST_PRICE,
        SECOND_PRICE,
        AVERAGE_PRICE
    }

    struct Bid {
        bytes32 hashedBid;
        string password;
        uint256 bidValue;
        bool hasBid;
        bool isVerified;
    }

    struct Auction {
        AuctionType auctionType;
        mapping(address => Bid) addressToBid;
        address payable[] bidders;
    }

    /**
     * This is our main item struct.
     * listingID is the the unique ID for each item
     * price is the price set by buyer for sale or paid by the winner of the auction
     * sellerID is the address of the seller who wants to sell the item
     * buyerID is the address of the buyer who paid for the item
     * itemStatus tells the current status of the item. It uses the enum status defined above
     */
    struct Item {
        uint256 listingID;
        string name;
        string description;
        uint256 price;
        address payable sellerID;
        status itemStatus;
        address buyerID;
        string encryptedString;
        Auction auction;
    }

    uint256 numOfItems = 0;

    /**
     * This mapping takes an address of a user as the input and returns the public key of that corresponding user.
     * The public key will be required by the seller so that he can encrypt the item string and send the encrypted string to the buyer.
     * The buyer will then decrpyt the encrypted string using their private key.
     */
    mapping(address => string) addressToPublicKey;

    /**
     * This array stores the list of all items
     */
    Item[] items;

    /**
     * This modifier is used by a function to check if the item with ID = itemID is accessed only by the seller of that item
     * @param itemID is the unique ID of the item
     */
    modifier onlyValidItemID(uint256 itemID) {
        require(itemID < numOfItems, "Invalid item ID!");
        _;
    }

    /**
     * This modifier is used by a function to check if the item with ID = itemID is accessed only by the seller of that item
     * @param itemID is the unique ID of the item
     */
    modifier onlySeller(uint256 itemID) {
        require(
            msg.sender == items[itemID].sellerID,
            "You do not own the item!"
        );
        _;
    }

    /**
     * This modifier is used by a function to check if the item with ID = itemID is accessed only by the buyer of that item
     * @param itemID is the unique ID of the item
     */
    modifier onlyBuyer(uint256 itemID) {
        require(
            msg.sender == items[itemID].buyerID,
            "You do not own the item!"
        );
        _;
    }

    /**
     * This modifier is used by a function to check if the item with ID = itemID is delivered
     * @param itemID is the unique ID of the item
     */
    modifier onlyDeliveredItem(uint256 itemID) {
        require(
            items[itemID].itemStatus == status.DELIVERED,
            "Item not available yet, please wait for the seller to deliver it!"
        );
        _;
    }

    /**
     * This function is used by a seller to add a new item for sale.
     * @param itemName is the name of the item
     * @param itemDescription describes the item the seller wants to sell
     * @param itemPrice is the price of the item with which the seller wants to sell it
     */
    function addItemForSale(
        string memory itemName,
        string memory itemDescription,
        uint256 itemPrice
    ) public {
        Item memory newItem;
        newItem.listingID = numOfItems++;
        newItem.name = itemName;
        newItem.description = itemDescription;
        newItem.price = itemPrice;
        newItem.sellerID = msg.sender;
        newItem.itemStatus = status.FOR_SALE;
        newItem
            .encryptedString = "Item not available yet, please wait for the seller to deliver it!";
        items.push(newItem);
    }

    /**
     * This function is used by a seller to add a new item for the auction.
     * @param itemName is the name of the item
     * @param itemDescription describes the item the seller wants to sell
     * @param auctionType describes the type of auction
     */
    function addItemForAuction(
        string memory itemName,
        string memory itemDescription,
        AuctionType auctionType
    ) public {
        Item memory newItem;
        newItem.listingID = numOfItems++;
        newItem.name = itemName;
        newItem.description = itemDescription;
        newItem.sellerID = msg.sender;
        newItem.itemStatus = status.FOR_AUCTION;
        Auction memory auction;
        auction.auctionType = auctionType;
        newItem.auction = auction;
        newItem
            .encryptedString = "Item not available yet, please wait for the seller to deliver it!";
        items.push(newItem);
    }

    /**
     * This function is called by the bidders to bid on the item.
     * @param itemID is the id of the item
     * @param hashedBid is the hashed value of the bid to keep the bid sealed
     */
    function bidAtAuction(uint256 itemID, bytes32 hashedBid)
        public
        onlyValidItemID(itemID)
    {
        require(
            items[itemID].itemStatus == status.FOR_AUCTION,
            "Item not available for bidding!"
        );
        require(
            msg.sender != items[itemID].sellerID,
            "Seller can not bid at their item!"
        );
        require(
            items[itemID].auction.addressToBid[msg.sender].hasBid == false,
            "Can only bid once!"
        );

        address buyerAddress = msg.sender;
        items[itemID].auction.addressToBid[buyerAddress].hashedBid = hashedBid;
        items[itemID].auction.addressToBid[buyerAddress].hasBid = true;
        items[itemID].auction.bidders.push(msg.sender);
    }

    /**
     * This function is used by a seller to stop the bidding.
     * @param itemID is the id of the item
     */
    function stopBidding(uint256 itemID)
        public
        onlyValidItemID(itemID)
        onlySeller(itemID)
    {
        require(
            items[itemID].itemStatus == status.FOR_AUCTION,
            "Invalid request, item was not up for bidding!"
        );

        items[itemID].itemStatus = status.PAY_AND_VERIFY;
    }

    //  function checkHash(string memory password)
    //     public view
    //     returns (uint256)
    // {
    //     return  keccak256(abi.encodePacked(msg.value));
    // }

    /**
     * This function is used to convert uint256 to string
     * Taken from here: https://stackoverflow.com/questions/47129173/how-to-convert-uint-to-string-in-solidity
     * @param _i is a variable of type uint
     * @return _uintAsString the string representation of _i
     */
    function uint2str(uint256 _i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * This function is used by the bidders to pay and verify their bidding.
     * @param itemID is the id of the item
     * @param publicKey is the public key of the bidder
     */
    function payAndVerifyBid(
        uint256 itemID,
        string memory publicKey,
        string memory password
    ) public payable onlyValidItemID(itemID) {
        require(
            items[itemID].itemStatus == status.PAY_AND_VERIFY,
            "Invalid request, item's not up for pay and verify!"
        );
        require(
            keccak256(abi.encodePacked(password, uint2str(msg.value))) !=
                items[itemID].auction.addressToBid[msg.sender].hashedBid,
            "Wrong Hash!"
        );
        require(
            items[itemID].auction.addressToBid[msg.sender].isVerified == false,
            "Already verified!"
        );

        address buyerAddress = msg.sender;
        items[itemID].auction.addressToBid[buyerAddress].password = password;
        items[itemID].auction.addressToBid[buyerAddress].bidValue = msg.value;
        items[itemID].auction.addressToBid[buyerAddress].isVerified = true;
        addressToPublicKey[buyerAddress] = publicKey;
    }

    /**
     * This function is used by a buyer to buy an item.
     * @param itemID is the unique ID of the item
     * @param publicKey is the unique publick key of the buyer
     */
    function buyItem(uint256 itemID, string memory publicKey)
        public
        payable
        onlyValidItemID(itemID)
    {
        require(
            items[itemID].itemStatus == status.FOR_SALE,
            "Item not available for sale!"
        );
        require(
            msg.sender != items[itemID].sellerID,
            "Seller can not buy their item!"
        );
        require(
            msg.value >= items[itemID].price,
            "Money less than the listing price!"
        );

        address buyerAddress = msg.sender;
        items[itemID].itemStatus = status.SOLD;
        items[itemID].buyerID = buyerAddress;
        addressToPublicKey[buyerAddress] = publicKey;
    }

    /**
     * This function is used to find the bidder with highest bid.
     * @param itemID is the id of the item
     */
    function firstPriceAuctionWinner(uint256 itemID)
        private
        onlyValidItemID(itemID)
    {
        address payable[] memory bidders = items[itemID].auction.bidders;
        address winner = items[itemID].sellerID;
        uint256 maxBidValue = 0;
        for (uint256 i = 0; i < bidders.length; i++) {
            Bid memory bid = items[itemID].auction.addressToBid[bidders[i]];
            if (bid.isVerified == true && bid.bidValue >= maxBidValue) {
                winner = bidders[i];
                maxBidValue = bid.bidValue;
            }
        }
        items[itemID].price = maxBidValue;
        items[itemID].buyerID = winner;
    }

    /**
     * This function is used to find the bidder with highest bid and second highest bid value.
     * @param itemID is the id of the item
     */
    function secondPriceAuctionWinner(uint256 itemID)
        private
        onlyValidItemID(itemID)
    {
        address payable[] memory bidders = items[itemID].auction.bidders;
        address winner = items[itemID].sellerID;
        uint256 maxBidValue = 0;
        uint256 secondMaxBidValue = 0;
        for (uint256 i = 0; i < bidders.length; i++) {
            Bid memory bid = items[itemID].auction.addressToBid[bidders[i]];
            if (bid.isVerified == true && bid.bidValue >= maxBidValue) {
                secondMaxBidValue = maxBidValue;
                maxBidValue = bid.bidValue;
                winner = bidders[i];
            } else if (
                bid.isVerified == true && bid.bidValue >= secondMaxBidValue
            ) {
                secondMaxBidValue = bid.bidValue;
            }
        }
        items[itemID].buyerID = winner;
        items[itemID].price = secondMaxBidValue;
    }

    /**
     * @return absolute difference of @param a and @param b
     */
    function absDiff(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? b - a : a - b;
    }

    /**
     * This function is used to find the bidder with bid closest to average bid.
     * @param itemID is the id of the item
     */
    function averagePriceAuctionWinner(uint256 itemID)
        private
        onlyValidItemID(itemID)
    {
        address payable[] memory bidders = items[itemID].auction.bidders;
        uint256 totalBidValue = 0;
        uint256 totalBidders = 0;
        for (uint256 i = 0; i < bidders.length; i++) {
            Bid memory bid = items[itemID].auction.addressToBid[bidders[i]];
            if (bid.isVerified == true) {
                totalBidValue += bid.bidValue;
                totalBidders += 1;
            }
        }
        address winner = items[itemID].sellerID;
        uint256 winnerBidValue = 0;
        uint256 diff = totalBidValue;
        for (uint256 i = 0; i < bidders.length; i++) {
            Bid memory bid = items[itemID].auction.addressToBid[bidders[i]];
            if (
                bid.isVerified == true &&
                absDiff(bid.bidValue * totalBidders, totalBidValue) <= diff
            ) {
                diff = absDiff(bid.bidValue * totalBidders, totalBidValue);
                winnerBidValue = bid.bidValue;
                winner = bidders[i];
            }
        }
        items[itemID].buyerID = winner;
        items[itemID].price = winnerBidValue;
    }

    /**
     * This function is used to find the winner of the auction and refund the bidders' money.
     * @param itemID is the id of the item
     */
    function declareWinner(uint256 itemID) private onlyValidItemID(itemID) {
        if (items[itemID].auction.auctionType == AuctionType.FIRST_PRICE)
            firstPriceAuctionWinner(itemID);
        else if (items[itemID].auction.auctionType == AuctionType.SECOND_PRICE)
            secondPriceAuctionWinner(itemID);
        else averagePriceAuctionWinner(itemID);
    }

    /**
     * This function is used to refund bidders' money.
     * @param itemID is the id of the item
     */
    function refundMoney(uint256 itemID) private onlyValidItemID(itemID) {
        address payable[] memory bidders = items[itemID].auction.bidders;
        for (uint256 i = 0; i < bidders.length; i++) {
            Bid memory bid = items[itemID].auction.addressToBid[bidders[i]];
            if (bid.isVerified == true) {
                if (bidders[i] != items[itemID].buyerID)
                    bidders[i].transfer(bid.bidValue);
                else if (bid.bidValue != items[itemID].price)
                    bidders[i].transfer(bid.bidValue - items[itemID].price);
            }
        }
    }

    /**
     * This function is used by a seller to stop the auction and declare the winner.
     * @param itemID is the id of the item
     */
    function stopAuction(uint256 itemID)
        public
        onlyValidItemID(itemID)
        onlySeller(itemID)
    {
        require(
            items[itemID].itemStatus == status.PAY_AND_VERIFY,
            "Invalid request, bids not verified or auction was already stopped!"
        );

        items[itemID].itemStatus = status.SOLD;
        declareWinner(itemID);
        refundMoney(itemID);
        if (items[itemID].buyerID == items[itemID].sellerID)
            items[itemID].itemStatus = status.NO_BIDS;
    }

    /**
     * This function is used to get the public Key of the buyer.
     * @param itemID is the unique ID of the item
     * @return Public Key of the buyer who bought item with ID = itemID
     */
    function getBuyerPublicKey(uint256 itemID)
        public
        view
        onlyValidItemID(itemID)
        returns (string memory)
    {
        require(
            items[itemID].itemStatus == status.SOLD ||
                items[itemID].itemStatus == status.DELIVERED,
            "Buyer not declared yet!"
        );
        return addressToPublicKey[items[itemID].buyerID];
    }

    /**
     * This function is used by a seller to transfer encrypted string to the buyer.
     * @param itemID is the unique ID of the item
     * @param encryptedItem is the encrypted Secret key sent by the seller using buyers Public Key
     */
    function deliverItem(uint256 itemID, string memory encryptedItem)
        public
        onlyValidItemID(itemID)
        onlySeller(itemID)
    {
        require(
            items[itemID].itemStatus == status.SOLD,
            "Item not sold or already delivered!"
        );

        items[itemID].encryptedString = encryptedItem;
        items[itemID].itemStatus = status.DELIVERED;
        items[itemID].sellerID.transfer(items[itemID].price);
    }

    // /**
    //  * This function is used to get the public Key of the seller.
    //  * @param itemID is the unique ID of the item
    //  * @return Public Key of the buyer who bought item with ID = itemID
    //  */
    // function getSellerPublicKey(uint256 itemID)
    //     public
    //     view
    //     onlyValidItemID(itemID)
    //     onlyDeliveredItem(itemID)
    //     returns (string memory)
    // {
    //     return addressToPublicKey[items[itemID].sellerID];
    // }

    /**
     * This function is used by the buyer to get the encrypted Secret string.
     * @param itemID is the unique ID of the item
     * @return encryptedString provided by the seller which can be decrypted by the buyer using their Private Key
     */
    function getItem(uint256 itemID)
        public
        view
        onlyValidItemID(itemID)
        onlyBuyer(itemID)
        onlyDeliveredItem(itemID)
        returns (string memory)
    {
        return items[itemID].encryptedString;
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    /**
     * This function is used by a buyer to view the items up for sale.
     * @return a string containing list of all available Items for bidding
     */
    function viewItemsForSale() public view returns (string memory) {
        string memory itemList = "";

        for (uint256 i = 0; i < items.length; i++) {
            if (items[i].itemStatus == status.FOR_SALE) {
                itemList = string(abi.encodePacked(itemList, "ID: "));
                itemList = string(
                    abi.encodePacked(itemList, uint2str(items[i].listingID))
                );
                itemList = string(abi.encodePacked(itemList, "; Name: "));
                itemList = string(abi.encodePacked(itemList, items[i].name));
                itemList = string(
                    abi.encodePacked(itemList, "; Description: ")
                );
                itemList = string(
                    abi.encodePacked(itemList, items[i].description)
                );
                itemList = string(abi.encodePacked(itemList, "; SellerID: "));
                itemList = string(
                    abi.encodePacked(itemList, toAsciiString(items[i].sellerID))
                );
                itemList = string(abi.encodePacked(itemList, "; Status: "));
                itemList = string(
                    abi.encodePacked(itemList, items[i].itemStatus)
                );
                itemList = string(abi.encodePacked(itemList, "; Buyer: "));
                itemList = string(
                    abi.encodePacked(itemList, toAsciiString(items[i].buyerID))
                );
                itemList = string(abi.encodePacked(itemList, "; Price: "));
                itemList = string(
                    abi.encodePacked(itemList, uint2str(items[i].price))
                );
                itemList = string(abi.encodePacked(itemList, "\n"));
            }
        }

        return itemList;
    }

    /**
     * This function is used by a buyer to view the listing.
     * @return a string containing list of all available Items for bidding
     */
    function viewItemsForAuction() public view returns (string memory) {
        string memory itemList = "";

        for (uint256 i = 0; i < items.length; i++) {
            if (
                items[i].itemStatus == status.FOR_AUCTION ||
                items[i].itemStatus == status.PAY_AND_VERIFY
            ) {
                itemList = string(abi.encodePacked(itemList, "ID: "));
                itemList = string(
                    abi.encodePacked(itemList, uint2str(items[i].listingID))
                );
                itemList = string(abi.encodePacked(itemList, "; Name: "));
                itemList = string(abi.encodePacked(itemList, items[i].name));
                itemList = string(
                    abi.encodePacked(itemList, "; Description: ")
                );
                itemList = string(
                    abi.encodePacked(itemList, items[i].description)
                );
                itemList = string(abi.encodePacked(itemList, "; SellerID: "));
                itemList = string(
                    abi.encodePacked(itemList, toAsciiString(items[i].sellerID))
                );
                itemList = string(abi.encodePacked(itemList, "; Status: "));
                itemList = string(
                    abi.encodePacked(itemList, items[i].itemStatus)
                );
                itemList = string(abi.encodePacked(itemList, "; Buyer: "));
                itemList = string(
                    abi.encodePacked(itemList, toAsciiString(items[i].buyerID))
                );
                itemList = string(abi.encodePacked(itemList, "\n"));
            }
        }

        return itemList;
    }

    /**
     * This function is used by a buyer to view the listing.
     * @return a string containing list of all available Items for bidding
     */
    function viewAllItems() public view returns (string memory) {
        string memory itemList = "";

        for (uint256 i = 0; i < items.length; i++) {
            itemList = string(abi.encodePacked(itemList, "ID: "));
            itemList = string(
                abi.encodePacked(itemList, uint2str(items[i].listingID))
            );
            itemList = string(abi.encodePacked(itemList, "; Name: "));
            itemList = string(abi.encodePacked(itemList, items[i].name));
            itemList = string(abi.encodePacked(itemList, "; Description: "));
            itemList = string(abi.encodePacked(itemList, items[i].description));
            itemList = string(abi.encodePacked(itemList, "; SellerID: "));
            itemList = string(
                abi.encodePacked(itemList, toAsciiString(items[i].sellerID))
            );
            itemList = string(abi.encodePacked(itemList, "; Status: "));
            itemList = string(abi.encodePacked(itemList, items[i].itemStatus));
            itemList = string(abi.encodePacked(itemList, "; Buyer: "));
            itemList = string(
                abi.encodePacked(itemList, toAsciiString(items[i].buyerID))
            );
            itemList = string(abi.encodePacked(itemList, "; Price: "));
            itemList = string(
                abi.encodePacked(itemList, uint2str(items[i].price))
            );
            itemList = string(abi.encodePacked(itemList, "; SecretString: "));
            itemList = string(
                abi.encodePacked(itemList, items[i].encryptedString)
            );
            itemList = string(abi.encodePacked(itemList, "\n"));
        }

        return itemList;
    }
}
