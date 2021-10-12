import React, { useState, useEffect, useContext } from "react";
import { Avatar, Row, Col, Tag, Modal, InputNumber, message } from "antd";
import { makeStyles } from '@material-ui/core/styles';
import { styled } from '@material-ui/core/styles';
import { red, green, purple } from '@material-ui/core/colors';
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
const EthCrypto = require('eth-crypto');

const { Meta } = Card;

const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(red[700]),
  backgroundColor: red[700],
  '&:hover': {
    backgroundColor: red[900],
  },
}));

const ColorButton2 = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(green[500]),
  backgroundColor: green[500],
  '&:hover': {
    backgroundColor: green[700],
  },
}));

const ColorButton3 = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: purple[500],
  '&:hover': {
    backgroundColor: purple[700],
  },
}));

const ItemCard = ({ item, setModal, payBid, bid, setBid, placebid, userAccount}) => {

  // console.log(Object.keys(localStorage));
  // console.log(localStorage.getItem(item.ID));
  // localStorage.clear();
  // const [bid, setBid] = useState(0);
  const handleBidChange = (val) =>
  {
    var oldBids = bid;
    oldBids[item.ID] = val;
    setBid(oldBids);
  }
  return (
    <Col>
    	<Card
				sx={{ maxWidth: 345 }}>
				<CardContent>
					<Typography gutterBottom variant="h4" component="div">
					{item.Name}
					</Typography>
					<Typography variant="body2" color="text.secondary">
					Description: {item.Description}
					</Typography>
					<Typography variant="body2" color="text.secondary">
					Auction Type: {item.AuctionType}
					</Typography>
				</CardContent>
				<CardActions>

						{item.Status == '\u0000' && localStorage.getItem(userAccount + item.ID) === null ?  (
              <div>
                <FormLabel component="legend">
								<b>Enter your Bid Amount</b>
								<br />
								</FormLabel>
								<TextField
									variant="standard"
									required
									onChange={(value) => handleBidChange(value.target.value)}
									value={bid[item.ID]}
								/>
								<br/>
								<br/>
								<div onClick={() => placebid(item.ID)}>
									<ColorButton2 variant="contained" size="small">Place Bid</ColorButton2>
								</div>

              </div>
						) : (
            item.Status == '\u0000' && localStorage.getItem(userAccount + item.ID) !== null ? (
              <ColorButton3 variant="contained" size="small"> Bid Placed: {localStorage.getItem(userAccount + item.ID)}</ColorButton3>
            ) : (
              item.Status == '\u0002' && localStorage.getItem(userAccount + item.ID) !== null ? (
                <div onClick={() => payBid(item.ID)}>
                  <ColorButton variant="contained" size="small"> Pay Bid: {localStorage.getItem(userAccount + item.ID)}</ColorButton>
                </div>
              ) : (
                <div>
                  <ColorButton2 variant="contained" size="small"> Paid </ColorButton2>
                </div>
              )
            )
          )}
				</CardActions>
			</Card>

    </Col>
  );
};

const Marketplace = (props) => {




  const [items, setItems] = useState([
  ]);
  const parseItem = (stringOfItems) => {
    const listItems = stringOfItems.split("\n");
    const newList = [];
    for (var i = 0; i < listItems.length - 1; i++) {
      const attributes = listItems[i].split(";");
      const item = {};
      for (var j = 0; j < attributes.length; j++) {
        const keyValue = attributes[j].split(":");
        const name = keyValue[0].trim();
        const value = keyValue[1].trim();
        item[name] = value;
        // console.log(name, value);
      }
      newList.push(item);
    }
    console.log(newList);
    if (newList != items) {
      setItems(newList);
    }
  }

  const [modal, setModal] = useState({ visible: false, itemId: "" });
  const [bid, setBid] = useState({});
  const { web3, accounts, contract, userAccount } = useContext(BlockchainContext);
  console.log(web3, accounts, contract, userAccount);

  useEffect(() => {
    if(localStorage.getItem(userAccount + "publicKey") == null)
		{
			const alice = EthCrypto.createIdentity();
			localStorage.setItem(userAccount + "publicKey", alice.publicKey);
			localStorage.setItem(userAccount + "privateKey", alice.privateKey);
		}
    // hashBid(2);
    // contract.getItem().then((stringOfItems) => {
    //   console.log(stringOfItems);
    // });
    console.log(typeof (userAccount));
    contract.viewItemsForAuction().then((stringOfItems) => {
      parseItem(stringOfItems);
    });
    // contract.checkHash("password", {from: userAccount, value: 2}).then(
    //   (ans)=>
    //   {
    //     console.log(ans.logs);
    //   }
    // );
  }, []);

  const hashBid = (placedBid) => {
    const password = "password";
    const hash = web3.utils.sha3(
      web3.utils.toHex(password + placebid),
      { encoding: "hex" });
    console.log(hash);
    return hash;
  }

  const placebid = (ID) => {
    const hash = hashBid(bid[ID]);
    contract.bidAtAuction(ID, hash, { from: userAccount });

    localStorage.setItem(userAccount + ID, bid[ID]);
  }

  const payBid = (ID) => {

    const bidValue = localStorage.getItem(userAccount + ID);
    hashBid(bidValue);
    const pub = localStorage.getItem(userAccount + "publicKey");
    contract.payAndVerifyBid(ID, "pub", "password", { from: userAccount, value: parseInt(bidValue) });
    localStorage.removeItem(userAccount + ID);
    // console.log(parseInt(bid));
  }


  // console.log(x);
  return items.length == 0 ? (
    "No items found"
  ) : (
    <>
      <Row align="center" gutter={[26, 26]}>
        {items.map((item, key) => {
           if (item.SellerID != userAccount.substring(2))
           {
            return <ItemCard item={item} setModal={setModal} payBid={payBid} bid={bid} setBid={setBid} placebid={placebid} userAccount={userAccount}/>;
           }
          })}
      </Row>

      {/* <Modal
        title="Painting By Picasso, 1756"
        centered
        visible={modal.visible}
        onOk={() => {
          placebid(modal.item.ID);
          message
            .loading("Placing the bid..", 2.5)
            .then(() => {
              message.success("Bid Placed Successfully", 2.5)
            })
            .catch(() => message.error("Error while placing the bid", 2.5));
          setModal({ visible: false, itemId: "" });
          setBid();
        }}
        onCancel={() => {
          setModal({ visible: false, itemId: "" });
          setBid();
        }}
        okText="Place Bid"
      >
        <img
          style={{
            width: "100%",
            maxHeight: "240px",
            objectFit: "cover",
            marginBottom: "20px",
          }}
          src={sampleImages[0]}
        />
        <InputNumber
          placeholder="Enter your bid amount"
          style={{ width: "100%" }}
          addonAfter={
            <EthereumIcon style={{ height: "1rem", marginRight: "5px" }} />
          }
          value={bid}
          onChange={(value) => setBid(value)}
        />
      </Modal> */}
    </>
  );
};

export default Marketplace;
