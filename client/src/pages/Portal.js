import React, { useState, useEffect, useContext } from "react";
import { Card, Avatar, Row, Col, Tag, Modal, InputNumber, message } from "antd";

import Chip from "../components/Chip";
import { sampleImages } from "../components/SampleImages";
import { BlockchainContext } from "../App";
// const EthCrypto = require('eth-crypto');

const { Meta } = Card;



const ItemCard = ({ item, setModal, stopBidding, stopAuction }) => {
	return (
    <Col>
      <Card
        style={{ width: 300, margin: "20px 0" }}
        cover={<img style={{ width: "100%" }} src={sampleImages[0]} />}
        actions={[
			item.Status == '\u0000'  ? (
				<div onClick={() => stopBidding(item) }>
					  Stop Bidding
				</div>
			  ) : (
				item.Status == '\u0002'  ? (
				<div onClick={() => stopAuction(item)}>
					Stop Auction
			 	 </div>
				) : (
					<div>
					  Delivered
	  				</div>
				  
				  )
				)
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
	const stopBidding = async(item) =>
	{
		await contract.stopBidding(item.ID, {from:userAccount});
	}
	const stopAuction = async(item) =>
	{
		// const alice = EthCrypto.createIdentity();

		// const secretMessage = 'My name is Satoshi Buterin';
		// const encrypted = await EthCrypto.encryptWithPublicKey(
		// 	alice.publicKey, // encrypt with alice's publicKey
		// 	secretMessage
		// );

		// const decrypted = await EthCrypto.decryptWithPrivateKey(
		// 	alice.privateKey,
		// 	encrypted
		// );

		await contract.stopAuction(item.ID, {from:userAccount});
		const secretString = "encrypteString";
		const buyerPublicKey = contract.getBuyerPublicKey(item.ID, {from:userAccount});
		const encrypteString = "encrypteString";
		console.log(buyerPublicKey);
		
		await contract.deliverItem(item.ID, encrypteString, buyerPublicKey,  {from:userAccount});
		console.log(item.ID);
	}

	function arrayEquals(a, b) {
		return Array.isArray(a) &&
			Array.isArray(b) &&
			a.length === b.length &&
			a.every((val, index) => val === b[index]);
	}
	const [items, setItems] = useState([]);
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
	contract.addItemForAuction(inputs.ItemName, inputs.ItemDescription, inputs.AuctionType, {from : userAccount}).then((stringOfItems) =>
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
	
	contract.viewItemsForAuction().then((stringOfItems) =>
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
			return <ItemCard item={item} setModal={setModal} stopBidding={stopBidding} stopAuction={stopAuction} />;
		  }
		})}
	  </Row>
	  
	</>
  );
};

export default Portal;
