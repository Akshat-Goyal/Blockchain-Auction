import React, { useState, useEffect, useContext } from "react";
import { Card, Avatar, Row, Col, Tag, Modal, InputNumber, message } from "antd";

import { sampleImages } from "../components/SampleImages";
import { ReactComponent as EthereumIcon } from "../assets/ethereum-icon.svg";
import { BlockchainContext } from "../App";

const { Meta } = Card;

const ItemCard = ({ item, setModal, getEncryptedString, encryptedString }) => {

  console.log(Object.keys(localStorage));    
  console.log(localStorage.getItem(item.ID) ); 
  // localStorage.clear(); 
  getEncryptedString(item.ID);  
  return (
    <Col>
      <Card
        style={{ width: 300, margin: "20px 0" }}
        cover={<img style={{ width: "100%" }} src={sampleImages[0]} />}
        actions={[
          <div onClick={() => setModal({ visible: true, itemId: item.ID, encryptedString: encryptedString })}>
          Show String
        </div>
        ]}
      >
        <Meta
          title={item.Name}
          description={item.Description}
        />
        <Tag
          style={{
            marginTop: "20px",
          }}
          color="green"
        >
          First Price Auction
        </Tag>
      </Card>
    </Col>
  );
};

const Cart = (props) => {
 
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
        const keyValue = attributes[j].split(":");
        const name = keyValue[0].trim();
        const value = keyValue[1].trim();
        item[name] = value;
        // console.log(name, value);
      }
      newList.push(item);
    }
    console.log(newList);
    if(newList != items)
    {
      setItems(newList);
    }
  }
  
  const [modal, setModal] = useState({ visible: false, itemId: "" });
  const [encryptedString, setEncryptedString] = useState();
  const {web3, accounts, contract, userAccount} = useContext(BlockchainContext);
  console.log(web3, accounts, contract, userAccount);
  
  useEffect(() => {

    contract.viewItemsForAuction().then((stringOfItems) =>
    {
     parseItem(stringOfItems);
    });
  
  }, []);

 

  
  const getEncryptedString = (ID) =>
  {
    // const bid = localStorage.getItem(ID);
    // hashBid(bid);
    contract.getItem(ID, {from: userAccount});
    contract.getItem(ID, {from: userAccount}).then((secretString) =>
    {
      setEncryptedString(secretString);
    });

    // localStorage.removeItem(ID);
    // console.log(parseInt(bid));
  }
  
  
  // console.log(x);
  return items.length == 0 ? (
    "No items found"
  ) : (
    <>
      <Row align="center" gutter={[26, 26]}>
        {items.map((item, key) => {
          console.log(item.Buyer);
          if(item.Buyer == userAccount.substring(2))
          {
            
            return <ItemCard item={item} setModal={setModal} getEncryptedString={getEncryptedString} encryptedString={encryptedString} />;
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
        {/* {getEncryptedString(modal.itemId)} */}
          {encryptedString};
       
      </Modal>
    </>
  );
};

export default Cart;