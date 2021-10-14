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

const ColorButton3 = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: purple[500],
  '&:hover': {
    backgroundColor: purple[700],
  },
}));

const ItemCard = ({ item, setModal, buyItem }) => {

  console.log(Object.keys(localStorage));
  // console.log(localStorage.getItem(item.ID) );
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
					Price: {item.Price}
					</Typography>
				</CardContent>
				<CardActions>

						{item.Status == '\u0001' ? (
              <div onClick={() => buyItem(item.ID, item.Price)}>
                <ColorButton3 variant="outlined">Buy</ColorButton3>

              </div>
						) : (
						 <div> </div>
						) }
				</CardActions>
			</Card>
			<br />
			<br />
    </Col>
  );
};

function stringToHex(str)
{
    const buf = Buffer.from(str, 'utf8');
    return buf.toString('hex');
}

function hexToString(str)
{
    const buf = new Buffer(str, 'hex');
    return buf.toString('utf8');
}


const Marketplace = (props) => {

  const [items, setItems] = useState([
  ]);
  const parseItem = (stringOfItems) =>
  {
    const listItems = stringOfItems.split("\n");
    const newList = [];
    for(var i=0; i<listItems.length-1; i++)
    {
      const attributes = listItems[i].split(";");
      const item = {};
      for(var j=0; j<attributes.length; j++)
      {
        const keyValue = attributes[j].split("^");
        const name = keyValue[0].trim();
        const value = keyValue[1].trim();
        item[name] = value;
      }
      if(item.Status == '\u0001')
        newList.push(item);
    }
    console.log(newList);
    if(newList != items)
    {
      setItems(newList);
    }
  }

  const [modal, setModal] = useState({ visible: false, itemId: "" });
  const [bid, setBid] = useState();
  const {web3, accounts, contract, userAccount} = useContext(BlockchainContext);
  console.log(web3, accounts, contract, userAccount);

  useEffect(() => {
    if(localStorage.getItem(userAccount + "publicKey") == null)
		{
			const alice = EthCrypto.createIdentity();
			localStorage.setItem(userAccount + "publicKey", alice.publicKey);
			localStorage.setItem(userAccount + "privateKey", alice.privateKey);
		}
    contract.viewAllItems().then((stringOfItems) =>
    {
     parseItem(stringOfItems);
    });
   }, []);



  const buyItem = (ID, Price) =>
  {
    console.log(localStorage);
    console.log(localStorage.getItem(userAccount + "publicKey"));
    const pub = localStorage.getItem(userAccount + "publicKey")
    // const pubString = hexToString(pub);
    const pubString = pub;
    contract.buyItem(ID, pubString, {from: userAccount, value: Price});
  }


  // console.log(x);
  return items.length == 0 ? (
    "No items found"
  ) : (
      <Row align="center" gutter={[26, 26]}>
        {items.map((item, key) => {
          if (item.SellerID != userAccount.substring(2))
          {
            return <ItemCard item={item} setModal={setModal} buyItem={buyItem} />;
          }
        })}
      </Row>

  );
};

export default Marketplace;
