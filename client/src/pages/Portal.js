import React, { useState, useEffect, useContext } from "react";
import { Card, Avatar, Row, Col, Tag, Modal, InputNumber, message } from "antd";

import Chip from "../components/Chip";
import { sampleImages } from "../components/SampleImages";
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
              Seller Options
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

const Portal = (props) => {
	const stopBidding = async() =>
	{
		await contract.stopBidding(modal.item.ID, {from:userAccount});
		console.log(modal.item.ID);
	}
	const stopAuction = async() =>
	{
		await contract.stopAuction(modal.item.ID, {from:userAccount});
		console.log(modal.item.ID);
	}
	
	function arrayEquals(a, b) {
		return Array.isArray(a) &&
			Array.isArray(b) &&
			a.length === b.length &&
			a.every((val, index) => val === b[index]);
	}
	const [items, setItems] = useState([
		{
			name: "Abc Def",
			auctionType: "Abc",
			seller: "ASas",
		},
	]);
	const [inputs, setInputs] = useState({
		ItemName: "",
		ItemDescription: "",
		AuctionType: "Type-1"
	});
	const [modal, setModal] = useState({ visible: false, itemId: "" });

	const handleChange = (event) => 
	{
		const target = event.target;
		const name = event.target.name;
		let value = target.type === 'checkbox' ? target.checked : target.value;
		setInputs(values => ({...values, [name]: value}))
	}
	
	const {web3, accounts, contract, userAccount} = useContext(BlockchainContext);
	const [user, setUser] = useState(userAccount);
	
  const handleSubmit = (event) => {
	event.preventDefault();
	contract.addNewItem(inputs.ItemName, inputs.ItemDescription, inputs.AuctionType, {from : userAccount}).then((stringOfItems) =>
	{
	  console.log(stringOfItems);
	});
  }

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
	if(!arrayEquals(newList, items))
	{
	setItems(newList);
	}
  }

  useEffect(() => {
	
	contract.viewItemsForBidding().then((stringOfItems) =>
	{
	 
	  parseItem(stringOfItems);
	
	});
  }, [inputs]);
  return (
	<>
	  <form onSubmit={handleSubmit}>
	  <label>Enter Name:
	  <input 
		type="text" 
		name="ItemName" 
		value={inputs.ItemName || ""} 
		onChange={handleChange}
	  />
	  </label>
	  <label>Enter Description:
		<input 
		  type="text" 
		  name="ItemDescription" 
		  value={inputs.ItemDescription || ""} 
		  onChange={handleChange}
		/>
		</label>
		<label>Choose Auction Type:
		<select value={inputs.AuctionType}  name="AuctionType" onChange={handleChange}>
			<option value="Type-1">Type1</option>
			<option value="Type-2">Type2</option>
			<option value="Type-3">Type3</option>
		  </select>
		</label>
		<input type="submit" />
	</form>
  
	  <Row style={{ width: "100%" }} align="center" gutter={[26, 26]}>
		{items.map((item, key) => {
		  console.log(item.SellerID, userAccount.substring(2));
		  console.log(item);
		  if(item.SellerID == userAccount.substring(2))
		  {	
			return <ItemCard item={item} setModal={setModal} />;
		  }
		})}
	  </Row>
	  <Modal
        title="Painting By Picasso, 1756"
        centered
        visible={modal.visible}
        onOk={() => {
          message
            .loading("Placing the bid..", 2.5)
            .then(() => 
            {
              message.success("Bid Placed Successfully", 2.5) 
            })
            .catch(() => message.error("Error while placing the bid", 2.5));
          setModal({ visible: false, itemId: "" });
        //   setBid();
        }}
        onCancel={() => {
          setModal({ visible: false, itemId: "" });
        //   setBid();
        }}
        okText="Place Bid"
      >
		<button onClick={() => stopBidding() }>
			Stop Bidding
		</button>
		<button onClick={() => stopAuction() }>
			Stop Auction
		</button>
	    <InputNumber
          placeholder="Enter your bid amount"
          style={{ width: "100%" }}
        />
      </Modal>
	</>
  );
};

export default Portal;
