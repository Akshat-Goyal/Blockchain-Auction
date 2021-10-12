import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Layout } from "antd";
import { makeStyles } from '@material-ui/core/styles';
import Navbar from "../components/Navbar";
import Marketplace from "./Marketplace";
import Portal from "./Portal";
import Cart from "./Cart";
import NotFound from "./NotFound";

const { Content, Footer } = Layout;

const Routes = (props) => {
  return (
    <BrowserRouter>
      <Layout>
        <Navbar />
        <Content
          style={{
            padding: "50px 50px",
            marginTop: 64,
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "column",
          }}
        >
          <Switch>
            <Route exact path="/">
              <Marketplace />
            </Route>
            <Route exact path="/portal">
              <Portal />
            </Route>
            <Route exact path="/cart">
              <Cart />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Made with{" "}
          <span role="img" aria-label="blue-heart">
            💙
          </span>{" "}
          by Team BlockDaggers
        </Footer>
      </Layout>
    </BrowserRouter>
  );
};

export default Routes;
