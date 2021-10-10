// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title A Modern Way
 * @dev Smart contract to facilitate buying and selling of items (Netflix Screens) securely
 */
contract AModernWay {
    /**
     * This is an enum which will help to keep the current status of an item.
     * The status WAITING signifies that the item is not yet avaialable for auction
     * The status STARTED signifies that the auction has started and bidders can start bidding
     * The status PAY_AND_VERIFY signifies that the bidders can pay to verify their bid
     * The status SOLD signifies that the item is sold to winner, and money is transferred to seller and bidders.
     * The status DELIVERED signifies that the item is delivered to the winner
     */
    enum status {
        WAITING,
        STARTED,
        PAY_AND_VERIFY,
        SOLD,
        DELIVERED
    }

    struct Bid{
        bytes32 hashedBid;
        uint256 bidValue;
        bool isVerified;
    }

   
    struct Auction{
        string auctionType;
        mapping(address => Bid) addressToBid;
        address payable[] bidders;
    }

     /**
     * This is our main item struct.
     * listingID is the the unique ID for each item
     * sellerID is the address of the seller who wants to sell the item
     * buyerID is the address of the buyer who paid for the item
     * itemStatus tells the current status of the item. It uses the enum status defined above
     */
    struct Item {
        uint256 listingID;
        string name;
        string description;
        address payable sellerID;
        status itemStatus;
        address winnerID;
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

    // /**
    //  * This modifier is used by a function to check if the item with ID = itemID is accessed only by the seller of that item
    //  * @param itemID is the unique ID of the item
    //  */
    // modifier onlySeller(uint256 itemID) {
    //     require(
    //         msg.sender == items[itemID].sellerID,
    //         "You do not own the item!"
    //     );
    //     _;
    // }

    // /**
    //  * This modifier is used by a function to check if the item with ID = itemID is accessed only by the buyer of that item
    //  * @param itemID is the unique ID of the item
    //  */
    // modifier onlyBuyer(uint256 itemID) {
    //     require(
    //         msg.sender == items[itemID].buyerID,
    //         "You do not own the item!"
    //     );
    //     _;
    // }

    // /**
    //  * This modifier is used by a function to check if the item with ID = itemID is in transit i.e. buyer has paid and is awaiting delivery from seller
    //  * @param itemID is the unique ID of the item
    //  */
    // modifier onlyInTransit(uint256 itemID) {
    //     require(
    //         items[itemID].itemStatus == status.IN_TRANSIT,
    //         "Item not available for delivery!"
    //     );
    //     _;
    // }

    /**
     * This function is used by a seller to add a new item to the listing.
     * @param itemName is the name of the item
     * @param itemDescription describes the item the seller wants to sell
     */
    function addNewItem(
        string memory itemName,
        string memory itemDescription
    ) public {
        Item memory newItem;
        newItem.listingID = numOfItems++;
        newItem.name = itemName;
        newItem.description = itemDescription;
        newItem.sellerID = msg.sender;
        newItem.itemStatus = status.WAITING;
        newItem.encryptedString = "Item not available yet, please wait for the seller to deliver it!";
        items.push(newItem);
    }

    /**
     * This function is used by a seller to start an auction for the item.
     * @param itemID is the id of the item
     * @param auctionType describes the type of the auction
     */
    function startAuction(
        uint256 itemID, string memory auctionType
    ) public {
        require(
            itemID < numOfItems,
            "Invalid item ID!"
        );
        require(
            items[itemID].itemStatus == status.WAITING,
            "Item not available for auction!"
        );
        require(
            msg.sender == items[itemID].sellerID,
            "Only seller can start the auction!"
        );
        
        Auction memory auction;
        auction.auctionType = auctionType;
        items[itemID].auction = auction;
        items[itemID].itemStatus = status.STARTED;
    }

    /**
     * This function is called by the bidders to bid for an item.
     * @param itemID is the id of the item
     * @param hashedBid is the hashed value of the bid to keep the bid sealed
     */
    function bidAtAuction(
        uint256 itemID, bytes32 hashedBid
    ) public {
        require(
            itemID < numOfItems,
            "Invalid item ID!"
        );
        require(
            items[itemID].itemStatus == status.STARTED,
            "Item not available for bidding!"
        );
        require(
            msg.sender != items[itemID].sellerID,
            "Seller can not buy their item!"
        );
        require(
            items[itemID].auction.addressToBid[msg.sender].hashedBid == keccak256(abi.encodePacked("")),
            "Can only bid once!"
        );

        address buyerAddress = msg.sender;
        items[itemID].auction.addressToBid[buyerAddress].hashedBid = hashedBid;
        items[itemID].auction.bidders.push(msg.sender);
    }


    /**
     * This function is used by a seller to stop the bidding.
     * @param itemID is the id of the item
     */
    function stopBidding(
        uint256 itemID
    ) public {
        require(
            itemID < numOfItems,
            "Invalid item ID!"
        );
        require(
            items[itemID].itemStatus == status.STARTED,
            "Invalid request. Item was not available for bidding!"
        );
        require(
            msg.sender == items[itemID].sellerID,
            "Only seller can stop the bidding!"
        );
        
        items[itemID].itemStatus = status.PAY_AND_VERIFY;
    }


    /**
     * This function is used by the bidders to pay and verify their bidding.
     * @param itemID is the id of the item
     * @param publicKey is the public key of the bidder
     */
    function payAndVerifyBid(
        uint256 itemID, string memory publicKey
    ) public payable {
        require(
            itemID < numOfItems,
            "Invalid item ID!"
        );
        require(
            items[itemID].itemStatus == status.PAY_AND_VERIFY,
            "todo"
        );
        require(
            keccak256(abi.encodePacked(msg.value, msg.sender)) == items[itemID].auction.addressToBid[msg.sender].hashedBid,
            "Wrong Hash!"
        );
        require(
            items[itemID].auction.addressToBid[msg.sender].isVerified == false,
            "Already verified"
        );
        
        address buyerAddress = msg.sender;
        items[itemID].auction.addressToBid[buyerAddress].bidValue = msg.value;
        items[itemID].auction.addressToBid[buyerAddress].isVerified = true;
        addressToPublicKey[buyerAddress] = publicKey;
    }

    /**
     * This function is used to find the winner of the auction, and transfer the money to seller and bidders.
     * @param itemID is the id of the item
     */
    function declareWinner(
        uint256 itemID
    ) private {
        require(
            itemID < numOfItems,
            "Invalid item ID!"
        );
        require(
            items[itemID].itemStatus == status.SOLD,
            "todo"
        );
       
        address payable[] memory bidders = items[itemID].auction.bidders;
        address winner = items[itemID].sellerID;
        uint256 maxBidValue = 0;
        for (uint256 i = 0; i < bidders.length; i++) 
        {
            Bid memory bid = items[itemID].auction.addressToBid[bidders[i]];
            if(bid.isVerified == true && bid.bidValue >= maxBidValue) 
            {
                winner = bidders[i];
                maxBidValue = bid.bidValue;
            }
        }
        for (uint256 i = 0; i < bidders.length; i++) 
        {
            Bid memory bid = items[itemID].auction.addressToBid[bidders[i]];
            if(bid.isVerified == true &&  bidders[i] != winner) 
            {
                bidders[i].transfer(bid.bidValue);
            }
        }
        items[itemID].sellerID.transfer(maxBidValue);
        items[itemID].winnerID = winner;
    }
    
    /**
     * This function is used by a seller to stop the auction and declare the winner.
     * @param itemID is the id of the item
     */
    function stopAuction(
        uint256 itemID
    ) public {
        require(
            itemID < numOfItems,
            "Invalid item ID!"
        );
        require(
            items[itemID].itemStatus == status.PAY_AND_VERIFY,
            "todo"
        );
        require(
            msg.sender == items[itemID].sellerID,
            "Only seller can stop the auction!"
        );

        items[itemID].itemStatus = status.SOLD;
        declareWinner(itemID);
    }

    // /**
    //  * This function is used by a buyer to buy an item.
    //  * @param itemID is the unique ID for each item
    //  * @param publicKey is the unique publick key of the buyer
    //  */
    // function buyItem(uint256 itemID, string memory publicKey) public payable {
    //     require(
    //         items[itemID].itemStatus == status.AVAILABLE,
    //         "Item not available for sale!"
    //     );

    //     require(
    //         items[itemID].price == msg.value,
    //         "Money not equal to the listing price!"
    //     );

    //     address buyerAddress = msg.sender;
    //     items[itemID].itemStatus = status.IN_TRANSIT;
    //     items[itemID].buyerID = buyerAddress;
    //     addressToPublicKey[buyerAddress] = publicKey;
       
    // }

    /**
     * This function is used to get the public Key of the winner.
     * @param itemID is the unique ID of the item
     * @return Public Key of the buyer who bought item with ID = itemID
     */
    function getWinnerPublicKey(uint256 itemID)
        public
        view
        returns (string memory)
    {
        require(
            itemID < numOfItems,
            "Invalid item ID!"
        );
        require(
            items[itemID].itemStatus == status.SOLD,
            "todo"
        );
        return addressToPublicKey[items[itemID].winnerID];
    }

    /**
     * This function is used by a seller to transfer encrypted string to the buyer.
     * @param itemID is the unique ID of the item
     * @param encryptedItem is the encrypted Secret key sent by the seller using buyers Public Key
     * @param publicKey is the public key of the seller
     */
    function deliverItem(uint256 itemID, string memory encryptedItem, string memory publicKey)
        public
    {
        require(
            itemID < numOfItems,
            "Invalid item ID!"
        );
        require(
            items[itemID].itemStatus == status.SOLD,
            "todo"
        );
        require(
            msg.sender == items[itemID].sellerID,
            "Only seller can deliver the item!"
        );

        addressToPublicKey[msg.sender] = publicKey;
        items[itemID].encryptedString = encryptedItem;
        items[itemID].itemStatus = status.DELIVERED;
    }

    /**
     * This function is used by the winner of the auction to get the encrypted Secret string.
     * @param itemID is the unique ID of the item
     * @return encryptedString provided by the seller which can be decrypted by the buyer using their Private Key
     */
    function getItem(uint256 itemID)
        public
        view
        returns (string memory)
    {
        require(
            itemID < numOfItems,
            "Invalid item ID!"
        );
        require(
            items[itemID].itemStatus == status.DELIVERED,
            "Item not available yet, please wait for the seller to deliver it!"
        );
        require(
            msg.sender == items[itemID].winnerID,
            "Only winner can get the item!"
        );

        return items[itemID].encryptedString;
    }

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
     * This function is used by a buyer to view the listing.
     * @return a string containing list of all available Items for bidding
     */
    function viewItemsForBidding() public view returns (string memory) {
        string memory itemList = "";

        for (uint256 i = 0; i < items.length; i++) {
            if (items[i].itemStatus == status.STARTED) {
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
                itemList = string(abi.encodePacked(itemList, "\n"));
            }
        }

        return itemList;
    }
}
