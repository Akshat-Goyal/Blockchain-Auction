import React, { useState, useEffect, useContext } from "react";
import { Layout, Menu, Row, Col } from "antd";
import { useLocation } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Avatar from "@material-ui/core/Avatar";
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
import { BlockchainContext } from "../App";
import { ReactComponent as EthereumIcon } from "../assets/ethereum-icon.svg";

const { Header } = Layout;

const parseBalance = (num, decimal) =>
  Math.round(10 ** decimal * (num / 10 ** 18)) / 10 ** decimal;

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
    margin: theme.spacing(1, 1.5),
    flexGrow: 1
  },
  link: {
    margin: theme.spacing(1, 1.5)
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const Navbar = (props) => {
  const classes = useStyles();
  const [currentPage, setCurrentPage] = useState(useLocation().pathname);
  const { web3, userAccount } = useContext(BlockchainContext);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    web3.eth
      .getBalance(userAccount)
      .then((currentBalance) => setBalance(currentBalance));
  }, []);

  return (
      <AppBar
          position="static"
          color="default"
          elevation={0}
          className={classes.appBar}
      >
       <Toolbar className={classes.toolbar}>
        <Typography color="textPrimary" variant="h6" className={classes.toolbarTitle}>
          Auction Bay
        </Typography>

        <Link
          variant="button"
          color="secondary"
          href="/market"
          className={classes.link}
        >
          Market Place
        </Link>
        <Link
          variant="button"
          color="secondary"
          href="/"
          className={classes.link}
        >
          Auction Place
        </Link>
        <Link
          variant="button"
          color="secondary"
          href="/portal"
          className={classes.link}
        >
          Seller Portal
        </Link>

        <Link
          variant="button"
          color="secondary"
          href="/cart"
          className={classes.link}
        >
          My Cart
        </Link>



        <Typography color="textPrimary" className={classes.link}>
          <EthereumIcon style={{ height: "1rem", marginRight: "5px" }} />
           {parseBalance(balance, 4)}
        </Typography>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
