import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import trufflecontract from "truffle-contract";

import getWeb3 from "./getWeb3";
// import AuctionContract from "./contracts/Auction.json";
import ModernWay from "./contracts/AModernWay.json";
import Layout from "./pages/Layout";
import * as loader from "./assets/loader.json";

import "./App.css";

export const BlockchainContext = createContext();

const App = (props) => {
  const [blockchain, setBlockchain] = useState({
    web3: null,
    accounts: null,
    contract: null,
    userAccount: null,
  });

  useEffect(() => {
    const init = async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        console.log(networkId);
        // const deployedNetwork = AuctionContract.networks[networkId];

        const contractUndeployed = trufflecontract(ModernWay);
        contractUndeployed.setProvider(web3.currentProvider);
        const contract = await contractUndeployed.deployed();

        let userAccount = await web3.eth.getCoinbase();

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        setBlockchain({ web3, accounts, contract, userAccount });
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    };
    init();
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loader.default,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const [load, setLoad] = useState(true);

  return blockchain.web3 === null || !load ? (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      Loading...
    </div>
  ) : (
    <BlockchainContext.Provider value={blockchain}>
      <Layout />
    </BlockchainContext.Provider>
  );
};

export default App;
