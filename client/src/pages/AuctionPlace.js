import React, { useState, useEffect, useContext } from "react";
import { Avatar, Row, Col, Tag, Modal, InputNumber, message } from "antd";
import { makeStyles } from "@material-ui/core/styles";
import { styled } from "@material-ui/core/styles";
import { red, green, purple } from "@material-ui/core/colors";
// import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Box from "@material-ui/core/Box";
// import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
// import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import InputLabel from "@material-ui/core/InputLabel";
import { sampleImages } from "../components/SampleImages";
import { ReactComponent as EthereumIcon } from "../assets/ethereum-icon.svg";
import { BlockchainContext } from "../App";
const EthCrypto = require("eth-crypto");

const { Meta } = Card;

const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(red[700]),
  backgroundColor: red[700],
  "&:hover": {
    backgroundColor: red[900],
  },
}));

const ColorButton2 = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(green[500]),
  backgroundColor: green[500],
  "&:hover": {
    backgroundColor: green[700],
  },
}));

const ColorButton3 = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: purple[500],
  "&:hover": {
    backgroundColor: purple[700],
  },
}));

/**
   * This is the item card.
   * All items available for auction are displayed to the user using cards.
   * It contains details like Name, Description, Auction Type
   * The user can also access the functions like placing bid, pay bid etc.

*/
const ItemCard = ({ item, payBid, bid, setBid, placebid, userAccount }) => {
  const handleBidChange = (val) => {
    var oldBids = bid;
    oldBids[item.ID] = val;
    setBid(oldBids);
  };
  return (
    <Col>
      <Card sx={{ maxWidth: 345 }}>
        <CardContent>
          <Typography gutterBottom variant="h4" component="div">
            {item.Name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Description: {item.Description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Auction Type: {item.AuctionName}
          </Typography>
        </CardContent>
        <CardActions>
          {item.Status == "\u0000" &&
          localStorage.getItem(userAccount + item.ID) === null ? (
            <div>
              <FormLabel component="legend">
                <b>Enter your Bid Amount</b>
                <br />
              </FormLabel>
              <TextField
                variant="standard"
                required
                type="number"
                onChange={(value) => handleBidChange(value.target.value)}
                value={bid[item.ID]}
              />
              <br />
              <br />
              <div onClick={() => placebid(item.ID)}>
                <ColorButton2 variant="contained" size="small">
                  Place Bid
                </ColorButton2>
              </div>
            </div>
          ) : item.Status == "\u0000" &&
            localStorage.getItem(userAccount + item.ID) !== null ? (
            <ColorButton3 variant="contained" size="small">
              {" "}
              Bid Placed: {localStorage.getItem(userAccount + item.ID)}
            </ColorButton3>
          ) : item.Status == "\u0002" &&
            localStorage.getItem(userAccount + item.ID) !== null ? (
            <div onClick={() => payBid(item.ID)}>
              <ColorButton variant="contained" size="small">
                {" "}
                Pay Bid: {localStorage.getItem(userAccount + item.ID)}
              </ColorButton>
            </div>
          ) : (
            <div>
              <ColorButton2 variant="contained" size="small">
                {" "}
                Paid{" "}
              </ColorButton2>
            </div>
          )}
        </CardActions>
      </Card>
    </Col>
  );
};

function stringToHex(str) {
  const buf = Buffer.from(str, "utf8");
  return buf.toString("hex");
}

function hexToString(str) {
  const buf = new Buffer(str, "hex");
  return buf.toString("utf8");
}

/**
   * React Functional component representing the Auction Place.
   * It contains functions for placing bid, pay bid etc.
   * It also contains various states used throughout the compnonent.

 */
const AuctionPlace = (props) => {
  /**
   * items State is an array containing all the items fetched from the contract.
   * bid State is an object  storing the bids placed on different items.
   * BlockchainContext contains contract details and useraccount details.
   */
  const [items, setItems] = useState([]);
  const [bid, setBid] = useState({});
  const { web3, accounts, contract, userAccount } =
    useContext(BlockchainContext);

  /**
   * parseItem parses the stringOfItems fetched from the contract to be displayed to the user.
   * @param stringOfItems is the string of list of items added to the contract
   */
  const parseItem = (stringOfItems) => {
    const listItems = stringOfItems.split("\n");
    const newList = [];
    for (var i = 0; i < listItems.length - 1; i++) {
      const attributes = listItems[i].split(";");
      const item = {};
      for (var j = 0; j < attributes.length; j++) {
        const keyValue = attributes[j].split("^");
        const name = keyValue[0].trim();
        const value = keyValue[1].trim();
        item[name] = value;
      }
      if (item.AuctionType == 0) {
        item["AuctionName"] = "First Price Auction";
      } else if (item.AuctionType == 1) {
        item["AuctionName"] = "Second Price Auction";
      } else if (item.AuctionType == 2) {
        item["AuctionName"] = "Average Price Auction";
      }
      if (item.Status == "\u0000" || item.Status == "\u0002")
        newList.push(item);
    }
    if (newList != items) {
      setItems(newList);
    }
  };
  /**
   *Function to generate a random password
   */
  function generatePassword(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  /**
   * This useeffect runs when the component loads.
   * userIdentity is created and Item details are fetched from the backend
   */
  useEffect(() => {
    if (localStorage.getItem(userAccount + "password") == null) {
      var password = generatePassword(10);
      localStorage.setItem(userAccount + "password", password);
    }
    if (localStorage.getItem(userAccount + "publicKey") == null) {
      const alice = EthCrypto.createIdentity();
      localStorage.setItem(userAccount + "publicKey", alice.publicKey);
      localStorage.setItem(userAccount + "privateKey", alice.privateKey);
    }
    contract.viewAllItems().then((stringOfItems) => {
      parseItem(stringOfItems);
    });
  }, []);

  /**
   * Function to hash the bid using sha3.
   * @param placebid bid placed by the user
   */
  const hashBid = (placedBid) => {
    const password = localStorage.getItem(userAccount + "password");
    const hash = web3.utils.sha3(web3.utils.toHex(password + placebid), {
      encoding: "hex",
    });
    return hash;
  };

  /**
   * Function to place the bid and call the bidAtAuction of contract.
   * @param ID Item Id for which the bid is placed.
   */
  const placebid = (ID) => {
    if (!bid[ID] || parseInt(bid[ID]) < 0) {
      alert("Please enter a non negative integer!");
      return;
    }
    const hash = hashBid(bid[ID]);
    contract.bidAtAuction(ID, hash, { from: userAccount }).then(() => {
      localStorage.setItem(userAccount + ID, bid[ID]);
    });
  };

  /**
   * Function to pay the bid and call the payAndVerifyBid of contract.
   * The buyer also sends its public key to the contrac to recieve
   * the secret string from the seller later.
   * @param ID Item Id for which the bid is paid.
   */
  const payBid = (ID) => {
    const bidValue = localStorage.getItem(userAccount + ID);
    const pub = localStorage.getItem(userAccount + "publicKey");
    contract
      .payAndVerifyBid(
        ID,
        pub,
        localStorage.getItem(userAccount + "password"),
        { from: userAccount, value: parseInt(bidValue) }
      )
      .then(() => {
        localStorage.removeItem(userAccount + ID);
      });
  };

  /**
   * Return value of functional component.
   */
  return items.length == 0 ? (
    "No items found"
  ) : (
    <>
      <Row align="center" gutter={[26, 26]}>
        {items.map((item, key) => {
          if (item.SellerID != userAccount.substring(2)) {
            return (
              <ItemCard
                item={item}
                payBid={payBid}
                bid={bid}
                setBid={setBid}
                placebid={placebid}
                userAccount={userAccount}
              />
            );
          }
        })}
      </Row>
    </>
  );
};

export default AuctionPlace;
