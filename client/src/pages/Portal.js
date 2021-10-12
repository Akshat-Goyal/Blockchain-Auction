import React, { useState, useEffect, useContext } from "react";
import { Card, Avatar, Row, Col, Tag, Modal, InputNumber, message } from "antd";
import { makeStyles } from '@material-ui/core/styles';
// import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
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
import Chip from "../components/Chip";
import { sampleImages } from "../components/SampleImages";
import { BlockchainContext } from "../App";
// const EthCrypto = require('eth-crypto');

const { Meta } = Card;


const useStyles = makeStyles(theme => ({
	"@global": {
		ul: {
			margin: 0,
			padding: 0,
			listStyle: "none"
		}
	},
	appBar: {
		borderBottom: `1px solid ${theme.palette.divider}`
	},
	toolbar: {
		flexWrap: "wrap"
	},
	toolbarTitle: {
		flexGrow: 1
	},
	link: {
		margin: theme.spacing(1, 1.5)
	},
	heroContent: {
		padding: theme.spacing(8, 0, 6)
	},
	cardHeader: {
		backgroundColor:
			theme.palette.type === "dark"
				? theme.palette.grey[700]
				: theme.palette.grey[200]
	},
	cardPricing: {
		display: "flex",
		justifyContent: "center",
		alignItems: "baseline",
		marginBottom: theme.spacing(2)
	},
	footer: {
		borderTop: `1px solid ${theme.palette.divider}`,
		marginTop: theme.spacing(8),
		paddingTop: theme.spacing(3),
		paddingBottom: theme.spacing(3),
		[theme.breakpoints.up("sm")]: {
			paddingTop: theme.spacing(6),
			paddingBottom: theme.spacing(6)
		}
	}
}));



const ItemCard = ({ item, setModal, stopBidding, stopAuction, deliverItem, secret, setSecret }) => {
	const handleSecretChange = (val) => {
		var oldSecret = secret;
		oldSecret[item.ID] = val;
		setSecret(oldSecret);
	}
	return (
		<Col>
			<Card
				style={{ width: 300, margin: "20px 0" }}
				cover={<img style={{ width: "100%" }} src={sampleImages[0]} />}
				actions={[
					item.Status == '\u0000' ? (
						<div onClick={() => stopBidding(item)}>
							Stop Bidding
						</div>
					) : (

						item.Status == '\u0001' ? (
							<div>
								Unsold
							</div>
						) :
							(
								item.Status == '\u0002' ? (
									<div onClick={() => stopAuction(item)}>
										Stop Auction
									</div>
								) : (
									item.Status == '\u0003' ? (
										<div>
											<input
												placeholder="Enter your Secret String"
												style={{ width: "100%" }}
												value={secret[item.ID]}
												onChange={(value) => handleSecretChange(value.target.value)}
											/>
											<div onClick={() => deliverItem(item)}>
												Deliver
											</div>
										</div>
									) : (
										<div>
											Delivered
										</div>

									)
								)
							)
					)
				]}
			>
				<Meta
					title={"Name : " + item.Name}
				/>
				<Meta
					title={"Description : " + item.Description}
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
					First Price Auction
				</Tag>
			</Card>
		</Col>
	);
};

const Portal = (props) => {
	const classes = useStyles();
	const stopBidding = async (item) => {
		await contract.stopBidding(item.ID, { from: userAccount });
	}
	const stopAuction = async (item) => {
		await contract.stopAuction(item.ID, { from: userAccount });
	}

	const deliverItem = async (item) => {
		const secretString = secret[item.ID];
		console.log(secretString);
		console.log(localStorage);
		const buyerPublicKey = contract.getBuyerPublicKey(item.ID, { from: userAccount });
		await contract.deliverItem(item.ID, secretString, "sellerPublicKey", { from: userAccount });
		// localStorage.removeItem(item.ID.toString()+"secretString");
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
	const [secret, setSecret] = useState({});

	const handleChange = (event) => {
		const target = event.target;
		const name = event.target.name;
		let value = target.type === 'checkbox' ? target.checked : target.value;
		setInputs(values => ({ ...values, [name]: value }))
	}

	const { web3, accounts, contract, userAccount } = useContext(BlockchainContext);
	const [user, setUser] = useState(userAccount);

	const handleSubmit = (event) => {
		event.preventDefault();
		console.log(inputs.ItemName);
		console.log(inputs.ItemDescription);
		console.log(inputs.AuctionType);
		if (inputs.AuctionType == 'FixedPrice') {
			console.log(inputs);
			contract.addItemForSale(inputs.ItemName, inputs.ItemDescription, inputs.ItemRate, { from: userAccount }).then((id) => {
				console.log(id);
				localStorage.setItem(id + "secretString", inputs.SecretString);
			});
		}
		else {
			contract.addItemForAuction(inputs.ItemName, inputs.ItemDescription, inputs.AuctionType, { from: userAccount }).then((id) => {
				localStorage.setItem(id + "secretString", inputs.SecretString);
			});
		}
	}

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
		if (!arrayEquals(newList, items)) {
			setItems(newList);
		}
	}

	useEffect(() => {

		contract.viewAllItems().then((stringOfItems) => {

			parseItem(stringOfItems);

		});
	}, [inputs]);

	return (

		<>

			<div>
				<form className={classes.form} noValidate>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<FormLabel component="legend">
								<b>Item Name</b>
								<br />
							</FormLabel>
							<TextField
								variant="outlined"
								required
								fullWidth
								name="ItemName"
								onChange={handleChange}
								value={inputs.ItemName || ""}
							/>
						</Grid>

						<Grid item xs={12}>
							<br />
							<FormLabel component="legend">
								<b>Item Description</b>
								<br />
							</FormLabel>
							<TextField
								variant="outlined"
								required
								fullWidth
								name="ItemDescription"
								onChange={handleChange}
								value={inputs.ItemDescription || ""}
							/>
						</Grid>
						{/* 
						<Grid item xs={12}>
							<br />
							<FormLabel component="legend">
								<b>Secret String</b>
								<br />
							</FormLabel>
							<TextField
								variant="outlined"
								required
								fullWidth
								name="SecretString"
								onChange={handleChange}
								value={inputs.SecretString || ""}
							/>
						</Grid> */}

						<Grid item xs={12}>
							<br />
							<FormLabel component="legend">
								<b>Item Type</b>
								<br />
								<br />

							</FormLabel>

							{/* <InputLabel id="demo-simple-select-label">Select type</InputLabel> */}
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={inputs.AuctionType}
								name="AuctionType"
								onChange={handleChange}
								label="Item Type"
							>
								<MenuItem value="FixedPrice">FixedPrice</MenuItem>
								<MenuItem value="Type-1">Type 1</MenuItem>
								<MenuItem value="Type-2">Type 2</MenuItem>
								<MenuItem value="Type-3">Type 3</MenuItem>
							</Select>

							{inputs.AuctionType == 'FixedPrice' ? (
								<TextField
									variant="outlined"
									required
									fullWidth
									name="ItemRate"
									onChange={handleChange}
									value={inputs.ItemRate || ""}
								// value={inputs.AuctionType || ""}
								/>
							) : (
								<div />
							)}

						</Grid>
					</Grid>
					<br />
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						onClick={handleSubmit}
					>
						Add Item to Market Place!
					</Button>
					<br />
					<br />
				</form>
			</div>

			<Row style={{ width: "100%" }} align="center" gutter={[26, 26]}>
				{items.map((item, key) => {
					console.log(item.SellerID, userAccount.substring(2));
					console.log(item);
					if (item.SellerID == userAccount.substring(2)) {
						return <ItemCard item={item} setModal={setModal} stopBidding={stopBidding} stopAuction={stopAuction} deliverItem={deliverItem} secret={secret} setSecret={setSecret} />;
					}
				})}
			</Row>



		</>

	);
};

export default Portal;
