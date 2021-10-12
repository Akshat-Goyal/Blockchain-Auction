import React, { useState, useEffect, useContext } from "react";
import { Card, Avatar, Row, Col, Tag, Modal, InputNumber, message } from "antd";

import { sampleImages } from "../components/SampleImages";
import { ReactComponent as EthereumIcon } from "../assets/ethereum-icon.svg";
import { BlockchainContext } from "../App";
// const EthCrypto = require('eth-crypto');

const { Meta } = Card;

const ItemCard = ({ item, setModal, buyItem }) => {

  console.log(Object.keys(localStorage));    
  console.log(localStorage.getItem(item.ID) ); 
  // localStorage.clear();   
  return (
    <Col>
      <Card
        style={{ width: 300, margin: "20px 0" }}
        cover={<img style={{ width: "100%" }} src={sampleImages[0]} />}
        actions={[
            item.Status == '\u0001' ? (
            <div>
              <div onClick={() => buyItem(item.ID, item.Price)}>
                Buy
              </div>
            </div>
          ) :(

                <div>
  
                </div>
          )
        ]}
      >
        <Meta
          title={"Name : "+  item.Name}
        />
        <Meta
          title={"Description : " +item.Description}
        />
         <Meta
          title={"Price : " + item.Price}
        />
        <Tag
          style={{
            marginTop: "20px",
          }}
          color="green"
        >
          {/* First Price Auction */}
        </Tag>
      </Card>
    </Col>
  );
};

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
  const [bid, setBid] = useState();
  const {web3, accounts, contract, userAccount} = useContext(BlockchainContext);
  console.log(web3, accounts, contract, userAccount);
  
  useEffect(() => {
    contract.viewItemsForSale().then((stringOfItems) =>
    {
     parseItem(stringOfItems);
    });
   }, []);

 
 
  const buyItem = (ID, Price) =>
  {
   
    contract.buyItem(ID, "publickKey", {from: userAccount, value: Price});
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
            return <ItemCard item={item} setModal={setModal} buyItem={buyItem} />;
          }
        })}
      </Row>

    
    </>
  );
};

export default Marketplace;
