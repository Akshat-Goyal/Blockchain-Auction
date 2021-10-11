import React, { useState, useEffect, useContext } from "react";
import { Card, Avatar, Row, Col, Tag, Modal, InputNumber, message } from "antd";

import { sampleImages } from "../components/SampleImages";
import { ReactComponent as EthereumIcon } from "../assets/ethereum-icon.svg";
import { BlockchainContext } from "../App";

const { Meta } = Card;

const ItemCard = ({ item, setModal }) => {
  return (
    <Col>
      <Card
        style={{ width: 300, margin: "20px 0" }}
        cover={<img style={{ width: "100%" }} src={sampleImages[0]} />}
        actions={[
          true ? (
            <div onClick={() => setModal({ visible: true, itemId: "", item: item })}>
              Place Bid
            </div>
          ) : (
            "Bid Placed"
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
    
    contract.viewItemsForBidding().then((stringOfItems) =>
    {
     parseItem(stringOfItems);
    });
  }, []);

  const hashBid = () =>
  {
    const encoded = web3.eth.abi.encodeParameters(['uint256', 'address'],[bid, userAccount])
    const hash = web3.utils.sha3(encoded, {encoding: 'hex'})

    console.log(hash);
    return hash;
  }

  const placebid = (ID) =>
  {
    const hash = hashBid();
    console.log(accounts);
    contract.bidAtAuction(ID, hash, {from: userAccount});
  }

  // console.log(x);
  return items.length == 0 ? (
    "No items found"
  ) : (
    <>
      <Row align="center" gutter={[26, 26]}>
        {items.map((item, key) => {
          return <ItemCard item={item} setModal={setModal} />;
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
