// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title A Modern Way
 * @dev Smart contract to facilitate buying and selling of items (Netflix Screens) securely
 */
contract AModernWay {
    /**
     * This is an enum which will help to keep the current status of an item.
     * The status AVAIABLE signifies that the item is avaialable for sell
     * The status IN_TRANSIT signifies that the item is in transit i.e. a buyer has paid for it and it waiting for seller to deliver
     * The status SOLD signifies that the item has already been sold
     */
    enum status {
        WAIT,
        START,
        PAY,
        SOLD
    }

    struct Bid{
        string hashedBid;
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
     * This modifier is used by a function to check if the item with ID = itemID is in transit i.e. buyer has paid and is awaiting delivery from seller
     * @param itemID is the unique ID of the item
     */
    modifier onlyInTransit(uint256 itemID) {
        require(
            items[itemID].itemStatus == status.IN_TRANSIT,
            "Item not available for delivery!"
        );
        _;
    }

    /**
     * This function is used by a seller to add a new item to the listing.
     * @param itemName is the name of the item
     * @param itemDescription describes the item the seller wants to sell
     * @param itemPrice is the price of the item with which the seller wants to sell it
     */
    function addNewItem(
        string memory itemName,
        string memory itemDescription,
        uint256 itemPrice
    ) public {
        Item memory newItem;
        newItem.listingID = numOfItems++;
        newItem.name = itemName;
        newItem.description = itemDescription;
        newItem.sellerID = msg.sender;
        newItem.itemStatus = status.WAIT;
        newItem.encryptedString = "Item not available yet, please wait for the seller to deliver it!";
        items.push(newItem);
    }


    /**
     * This function is used by a seller to start an auction to an item..
     * @param itemId is the name of the item
     * @param auctionType describes the item the seller wants to sell
     */
    function startAuction(
        string memory itemId, string memory auctionType

    ) public {
         require(
            items[itemId].itemStatus == status.WAIT,
            "Item not available for sale!"
        );
           require(
            msg.sender == items[itemId].sellerID,
            "Item not available for sale!"
        );
        
        Auction memory auction;
        auction.auctionType = auctionType;
        items[itemId].auction = auction;
        items[itemId].itemStatus = status.START;
        
    }

    /**
     * This function is used by a seller to start an auction to an item..
     * @param itemId is the name of the item
     */
    function bidAuction(
        string memory itemId, string memory hashedBid
    ) public {
         require(
            items[itemId].itemStatus == status.START,
            "Item not available for sale!"
        );
        require(
            msg.sender != items[itemId].sellerID,
            "Seller can not buy their item!"
        );
        require(
             items[itemId].auction.addressToBid[msg.sender].hashedBid == "",
            "Can only bid once"
        );
        address buyerAddress = msg.sender;
        items[itemId].itemStatus = status.VERIFY;
        items[itemId].auction.addressToBid[buyerAddress].hashedBid = hashedBid;
        items[itemId].auction.bidders.push(msg.sender);
    }


    /**
     * This function is used by a seller to start an auction to an item..
     * @param itemId is the name of the item
     */
    function stopBidding(
        string memory itemId
    ) public {
         require(
            items[itemId].itemStatus == status.START,
            "Item not available for sale!"
        );
           require(
            msg.sender == items[itemId].sellerID,
            "Item not available for sale!"
        );
        
        items[itemId].itemStatus = status.PAY;
    }


     /**
     * This function is used by a seller to start an auction to an item..
     * @param itemId is the name of the item
     */
    function payBid(
        string memory itemId, string memory publicKey
    ) public payable {
         require(
            items[itemId].itemStatus == status.PAY,
            "todo"
        );
        require(
             keccak256(abi.encodePacked(msg.value, msg.sender)) == items[itemId].auction.addressToBid[msg.sender].hashedBid,
            "Wrong Hash"
        );
        require(
            items[itemId].auction.addressToBid[msg.sender].isVerified == false,
            "Already verified"
        );
        
        address buyerAddress = msg.sender;
        items[itemId].itemStatus = status.VERIFY;
        items[itemId].auction.addrssToBid[buyerAddress].bidValue = msg.value;
        items[itemId].auction.addrssToBid[buyerAddress].isVerified = true;
        addressToPublicKey[buyerAddress] = publicKey;
    }

        /**
     * This function is used by a seller to start an auction to an item..
     * @param itemId is the name of the item
     */
    function declareWinner(
        string memory itemId
    ) private {
         require(
            items[itemId].itemStatus == status.SOLD,
            "Item not available for sale!"
        );
       
        address payable[] memory bidders = items[itemId].auction.bidders;
        address winner=items[itemId].sellerID;
        uint256 maxBidValue = 0;
        for (uint256 i = 0; i < bidders.length; i++) 
        {
            Bid memory bid = items[itemId].auction.addressToBid[bidders[i]];
            if(bid.isVerified == true && bid.bidValue>=maxBidValue) 
            {
                winner = bidders[i];
                maxBidValue = bid.bidValue;
            }
        }
        for (uint256 i = 0; i < bidders.length; i++) 
        {
            Bid memory bid = items[itemId].auction.addressToBid[bidders[i]];
            if(bid.isVerified == true &&  bidders[i] != winner) 
            {
                bidders[i].transfer(bid.bidValue);
            }
        }
        items[itemId].sellerID.transfer(maxBidValue);
        items[itemId].winnerID = winner;
    }
    
    /**
     * This function is used by a seller to start an auction to an item..
     * @param itemId is the name of the item
     */
    function stopAuction(
        string memory itemId
    ) public {
         require(
            items[itemId].itemStatus == status.PAY,
            "Item not available for sale!"
        );
           require(
            msg.sender == items[itemId].sellerID,
            "todo"
        );
        items[itemId].itemStatus = status.SOLD;
        declareWinner(itemId);
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
       //  addressToPublicKey[buyerAddress] = publicKey;
       
    // }

    /**
     * This function is used by a seller to get public Key of the buyer .
     * @param itemID is the unique ID for each item
     *  @return Public Key of the buyer who bought item with ID = itemID
     */
    function getWinnerPublicKey(uint256 itemID)
        public
        view
        returns (string memory)
    {
        require(
            items[itemID].itemStatus == status.SOLD,
            "Item not available for sale!"
        );
           require(
            msg.sender == items[itemID].sellerID,
            "todo"
        );
        return addressToPublicKey[items[itemID].winnerID];
    }

    /**
     * This function is used by a seller to transfer encrypted string to the buyer and also recieve the payment.
     * @param itemID is the unique ID for each item
     * @param encryptedItem is the encrypted Secret key sent by the seller using buyers Public Key
     */
    function deliverItem(uint256 itemID, string memory encryptedItem)
        public
        onlySeller(itemID)
        onlyInTransit(itemID)
    {
        require(
            items[itemID].itemStatus == status.SOLD,
            "Item not available for sale!"
        );
        require(
            msg.sender == items[itemID].sellerID,
            "todo"
        );
        address payable sellerAddress = items[itemID].sellerID;
        items[itemID].encryptedString = encryptedItem;
        // sellerAddress.transfer(items[itemID].price);
    }

    /**
     * This function is used by a buyer to get the encrypted Secret string after completing the purchase.
     * @param itemID is the unique ID for each item
     * @return encryptedString provided by the seller which can be decrypted by the buyer using their Private Key
     */
    function getItem(uint256 itemID)
        public
        view
        // onlyBuyer(itemID)
        returns (string memory)
    {
        require(
            items[itemID].itemStatus == status.SOLD,
            "Item not available yet, please wait for the seller to deliver it!"
        );
         require(
            msg.sender == items[itemID].winnerID,
            "todo"
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
     * @return a string containing list of all available Items
     */
    function viewItems() public view returns (string memory) {
        string memory itemList = "";

        for (uint256 i = 0; i < items.length; i++) {
            if (items[i].itemStatus == status.AVAILABLE) {
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
                itemList = string(abi.encodePacked(itemList, "; Price: "));
                itemList = string(
                    abi.encodePacked(itemList, uint2str(items[i].price))
                );
                itemList = string(abi.encodePacked(itemList, "\n"));
            }
        }

        return itemList;
    }
}
