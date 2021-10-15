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

const { Meta } = Card;
const EthCrypto = require("eth-crypto");

const ColorButton3 = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: purple[500],
  "&:hover": {
    backgroundColor: purple[700],
  },
}));


/**
   * This is the item card.
   * All items bought by the user are displayed to the user using ItemCard.
   * It contains details like Name, Description, Price etc.
   * The user can also see teh secret String. 
   
*/
const ItemCard = ({
  item,
  setModal,
  getEncryptedString,
  encryptedString,
  userAccount,
}) => {
  const [decryptedString, setDecryptedString] = useState();

  useEffect(() => {
    async function getDecrpyted() {
      const privateKey = localStorage.getItem(userAccount + "privateKey");
      const encryptedString = JSON.parse(item.SecretString);

      const decrypted = await EthCrypto.decryptWithPrivateKey(
        privateKey,
        encryptedString
      );

      setDecryptedString(decrypted);
    }

    if (item.Status == '\u0004')
      getDecrpyted();
  }, []);

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
            Price: {item.Price}
          </Typography>
        </CardContent>
        <CardActions>
          {item.Status == "\u0004" ? (
            <Typography variant="body2" color="text.secondary">
              Secret String: {decryptedString}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              <ColorButton3 variant="outlined">
                Waiting for Delivery
              </ColorButton3>
            </Typography>
          )}
        </CardActions>
      </Card>
      <br />
      <br />

    </Col>
  );
};


/**
   * React Functional component representing the Auction Place. 
   * It contains various states and functions used throughout the compnonent.
*/
const Cart = (props) => {
  /**
  * items State is an array containing all the items fetched from the contract.
  * encryptedString is the object  storing the secret string for different items.
  * BlockchainContext contains contract details and useraccount details.
 */
  const [modal, setModal] = useState({ visible: false, itemId: "" });
  const [encryptedString, setEncryptedString] = useState({});
  const { web3, accounts, contract, userAccount } = useContext(BlockchainContext);
  const [items, setItems] = useState([]);

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
        // console.log(name, value);
      }
      newList.push(item);
    }
    console.log(newList);
    if (newList != items) {
      setItems(newList);
    }
  };

 /**
    * This useeffect runs when the component loads. 
    * userIdentity is created and Item details are fetched from the backend
  */
  useEffect(() => {
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
   * Return value of functional component.
  */
  return items.length == 0 ? (
    "No items found"
  ) : (
    <>
      <Row align="center" gutter={[26, 26]}>
        {items.map((item, key) => {
          console.log(item.Buyer);
          if (item.Buyer == userAccount.substring(2)) {
            return (
              <ItemCard
                item={item}
                setModal={setModal}
                encryptedString={encryptedString}
                userAccount={userAccount}
              />
            );
          }
        })}
      </Row>

      <Modal
        title="Painting By Picasso, 1756"
        centered
        visible={modal.visible}
        onOk={() => {
          setModal({ visible: false, itemId: "" });
        }}
        onCancel={() => {
          setModal({ visible: false, itemId: "" });
        }}
      >
        {encryptedString};
      </Modal>
    </>
  );
};

export default Cart;
