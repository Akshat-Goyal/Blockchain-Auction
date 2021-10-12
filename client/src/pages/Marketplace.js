import React, { useState, useEffect, useContext } from "react";
import { Card, Avatar, Row, Col, Tag, Modal, InputNumber, message } from "antd";

import { sampleImages } from "../components/SampleImages";
import { ReactComponent as EthereumIcon } from "../assets/ethereum-icon.svg";
import { BlockchainContext } from "../App";

const { Meta } = Card;

const ItemCard = ({ item, setModal, payBid }) => {

  console.log(Object.keys(localStorage));    
  console.log(localStorage.getItem(item.ID) ); 
  // localStorage.clear();   
  return (
    <Col>
      <Card
        style={{ width: 300, margin: "20px 0" }}
        cover={<img style={{ width: "100%" }} src={sampleImages[0]} />}
        actions={[
            item.Status == '\u0000' && localStorage.getItem(item.ID) === null ? (
            <div>
              <div onClick={() => setModal({ visible: true, itemId: "", item: item })}>
                Place Bid
              </div>
            </div>
          ) : (
            item.Status == '\u0000' && localStorage.getItem(item.ID) !== null  ? (
              <div>
                Bid Placed - {localStorage.getItem(item.ID)}
              </div>
            ) : (
              item.Status == '\u0002'  && localStorage.getItem(item.ID) !== null ? (
                <div onClick={() => payBid(item.ID)}>
                  Pay Bid - {localStorage.getItem(item.ID)}
                </div>
              ) : (
                <div>
                  Paid
  
                </div>
              )
            )
          ),
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
    contract.getItem().then((stringOfItems) =>
    {
     console.log(stringOfItems);
    });
    console.log(typeof(userAccount));
    contract.viewItemsForAuction().then((stringOfItems) =>
    {
     parseItem(stringOfItems);
    });
    // contract.checkHash("password", {from: userAccount, value: 2}).then(
    //   (ans)=>
    //   {
    //     console.log(ans.logs);
    //   }
    // );
  }, []);

  const hashBid = (placedBid) =>
  {
    const password = "password";
    // const encoded = web3.eth.abi.encodeParameters(['string', 'uint256', 'address'],[password, placedBid, userAccount]);
    // const hash = web3.utils.keccak256(encoded)
    const hash = web3.utils.sha3(
    web3.utils.toHex(password + placebid),
    { encoding: "hex" }
    );
    console.log(hash);
    return hash;
  }
  
  const placebid = (ID) =>
  {
    const hash = hashBid(bid);
    contract.bidAtAuction(ID, hash, {from: userAccount});
    // contract.checkHash("password", {from: userAccount, value: 2});
    
    localStorage.setItem(ID, bid);
  }
  
  const payBid = (ID) =>
  {
    const bid = localStorage.getItem(ID);
    hashBid(bid);
    contract.payAndVerifyBid(ID, "publickKey", "password"   , {from: userAccount, value: parseInt(bid)});
    localStorage.removeItem(ID);
    console.log(parseInt(bid));
  }
  
  
  // console.log(x);
  return items.length == 0 ? (
    "No items found"
  ) : (
    <>
      <Row align="center" gutter={[26, 26]}>
        {items.map((item, key) => {
          return <ItemCard item={item} setModal={setModal} payBid={payBid} />;
        })}
      </Row>

      <Modal
        title="Painting By Picasso, 1756"
        centered
        visible={modal.visible}
        onOk={() => {
          placebid(modal.item.ID);
          message
          .loading("Placing the bid..", 2.5)
          .then(() => 
          {
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
      </Modal>
    </>
  );
};

export default Marketplace;
