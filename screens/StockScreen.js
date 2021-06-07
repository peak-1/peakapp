import axios from "axios";
import React, { Component, useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";

import {
  DefaultTheme,
  Card,
  Chip,
  Button,
  Searchbar,
  IconButton,
  Title,
  Provider as PaperProvider,
} from "react-native-paper";
import {
  SafeAreaView,
  Dimensions,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  Linking,
} from "react-native";
import Spinner from "../components/Spinner";

const screenWidth = Dimensions.get("window").width;

let timestamp = Math.round(Date.now() / 1000);
let yesterday = timestamp - 604800;
// let yesterday = timestamp - 86400;

let from = yesterday.toString();
let to = timestamp.toString();

const apiKey = "c29d3o2ad3ib4ac2prkg";

export class StockScreen extends React.Component {
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {
      loadingPrice: true,
      loadingData: true,
      loadingCandle: true,
      loaded: [],
      datePrice: [],
      dataCandle: [],
      data: [],
      stocks: [],
      candles: [],
      price: [],
      stockList: [
        "AAPL",
        "TSLA",
        "GOOG",
        "FB",
        "BP",
        "TWTR",
        "AMZN",
        "BAC",
        "BA",
        "AXS",
        "ADCT",
        "ATR",
        "ALV",
        "ALK",
        "AU",
        "ASPN",
        "AAT",
        "SPOT",
        "AMC",
        "NFLX",
        "PK",
      ],
    };
  }

  getCurrentPrice() {
    let priceData = {};
    let loadedStock = [];
    this.state.stockList.forEach((stock) => {
      fetch(`https://finnhub.io/api/v1/quote?symbol=${stock}&token=${apiKey}`)
        .then((response) => response.json())
        .then((priceList) => {
          let priceChange = priceList.c - priceList.pc;
          let percentage = (100 / priceList.pc) * priceChange;
          let color;
          let profit;
          if (priceChange > 0) {
            color = "0,150,0,";
            profit = "green";
          } else {
            color = "150,0,0,";
            profit = "red";
          }
          priceData[stock] = {
            currentPrice: priceList.c.toFixed(2),
            open: priceList.o,
            low: priceList.l,
            high: priceList.h,
            previousClose: priceList.pc,
            priceChange: priceChange,
            percentage: percentage,
            color: color,
            stockColor: profit,
          };
          loadedStock.push(stock);
        })
        .then(() => {
          if (
            this.state.stockList.length == Object.keys(priceData).length &&
            this.state.loadingCandle == false &&
            this.state.loadingData == false
          ) {
            console.log("Current price done");
            this.setState({
              price: priceData,
              loaded: loadedStock,
            });
          } else if (
            this.state.stockList.length == Object.keys(priceData).length
          ) {
            console.log("Current price done");
            this.setState({
              price: priceData,
              loadingPrice: false,
            });
          }
        })
        .catch((err) => {
          console.log("error in getCurrentPrice");
          console.log(err);
        });
    });
  }

  callChartData() {
    let stockCandle = {};
    let loadedStock = [];
    this.state.stockList.forEach((stock) => {
      fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${stock}&resolution=60&from=${from}&to=${to}&token=${apiKey}`
      )
        .then((response) => response.json())
        .then((chartData) => {
          console.log(chartData);
          stockCandle[stock] = {
            open: chartData.o,
            high: chartData.h,
            low: chartData.l,
            close: chartData.c,
            volume: chartData.v,
            timestamp: chartData.t,
            status: chartData.s,
          };
          if (chartData.s == "no_data" || chartData.o == null) {
            stockCandle[stock] = {
              open: [0, 0],
              high: [0, 0],
              low: [0, 0],
              close: [0, 0],
              volume: [0, 0],
            };
            loadedStock.push(stock);
          } else {
            loadedStock.push(stock);
          }
        })
        .then(() => {
          if (
            Object.keys(stockCandle).length == this.state.stockList.length &&
            this.state.loadingData == false &&
            this.state.loadingPrice == false
          ) {
            this.setState({
              candles: stockCandle,
              loaded: loadedStock,
            });
          } else if (
            Object.keys(stockCandle).length == this.state.stockList.length
          ) {
            this.setState({
              candles: stockCandle,
              loadingData: false,
            });
          }
        })
        .catch((err) => {
          console.log("error in callChartData");
          console.log(err);
        });
    });
  }

  getData() {
    let stockData = {};
    let loadedStock = [];
    this.state.stockList.forEach((stock) => {
      fetch(
        `https://finnhub.io/api/v1/stock/profile?symbol=${stock}&token=c29d3o2ad3ib4ac2prkg`
      ) // hide api key from
        .then((response) => response.json())
        .then((stocksList) => {
          let symbol;
          if (stocksList.currency == "USD") {
            symbol = "$";
          } else {
            symbol = "£";
          }

          stockData[stock] = {
            name: stocksList.name,
            country: stocksList.country,
            currency: symbol,
            ticker: stocksList.ticker,
            price: stocksList.shareOutstanding,
            logo: `https://storage.googleapis.com/iex/api/logos/${stocksList.ticker}.png`,
            // write logic to check if logo exists and to input placeholder logo if it doesnt
            exchange: stocksList.exchange,
            industry: stocksList.finnhubIndustry,
          };

          loadedStock.push(stock);
        })
        .then(() => {
          if (
            this.state.stockList.length == Object.keys(stockData).length &&
            this.state.loadingCandle == false &&
            this.state.loadingPrice == false
          ) {
            this.setState({
              stocks: stockData,
              loaded: loadedStock,
            });
          } else if (
            this.state.stockList.length == Object.keys(stockData).length
          ) {
            this.setState({
              stocks: stockData,
              loadingData: false,
            });
          }
        })
        .catch((err) => {
          console.log("error in getData");
          console.log(err);
        });
    });
  }

  componentDidMount() {
    this.getData();
    this.callChartData();
    this.getCurrentPrice();
  }

  render() {
    console.log(this.props.navigation);
    const candles = this.state.candles;
    const stockData = this.state.stocks;
    const loaded = this.state.loaded;
    const priceData = this.state.price;

    const listItems = loaded.map((stock) => (
      <TouchableOpacity onPress={() => this.props.route.next.navigation.navigate("Details", {stock:stock})  } >
        <Card
          style={styles.card}
        >
          <View style={styles.stockNameView}>
            <Text style={styles.stockName}>{stockData[stock].name}</Text>
            <Text style={styles.stockTicker}>
              {stockData[stock].ticker}-{stockData[stock].country}
            </Text>
          </View>

          <Text style={styles.price}>
            {stockData[stock].currency}
            {priceData[stock].currentPrice}
          </Text>
          <Text style={styles[priceData[stock].stockColor]}>
            {priceData[stock].priceChange.toFixed(2)}
            {"("}
            {priceData[stock].percentage.toFixed(2)}%{")"}
          </Text>

          {/* <Button
            title="go"
            icon="chevron-right-circle"
            onPress={() => this.props.navigation.navigate("Home")}
          /> */}
          <View
            style={{
              display: "flex",
              marginRight: 30,
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <View>
              <Image
                style={styles.image}
                source={{
                  uri: `https://storage.googleapis.com/iex/api/logos/${stockData[stock].ticker}.png`,
                }}
              />
            </View>
            {/* <View
              style={{
                position: "absolute",
                right: -30,
                top: 50,
                alignSelf: "center",
              }}
            >
              <Text style={styles.titleText}>{stockData[stock].ticker}</Text>
            </View> */}
          </View>
          <LineChart
            bezier
            hideLegend={true}
            segments={1}
            withHorizontalLabels={false}
            data={{
              datasets: [
                {
                  data: candles[stock].open,
                },
              ],
            }}
            width={screenWidth - 25} // from react-native
            height={65}
            withHorizontalLabels={false}
            chartConfig={{
              withDots: false,
              strokeWidth: 2,
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(${priceData[stock].color}0.9)`,
              fillShadowGradientOpacity: 1,
              fillShadowGradient: priceData[stock].stockColor,

              propsForBackgroundLines: {
                stroke: "transparent",
              },
              propsForDots: {
                r: "0",
                strokeWidth: "0",
                stroke: "#111111",
              },
            }}
            style={{
              paddingRight: 0,
              margin: 5,
              borderRadius: 20,
              marginRight: 0,
              bottom: 1,
              position: "absolute",
            }}
          />
        </Card>
      </TouchableOpacity>
    ));

    if (this.state.loaded.length == 0) {
      return <Spinner />;
    }

    return (
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <Searchbar
            mode="contained"
            style={{ margin: 10, backgroundColor: "gainsboro" }}
            inputStyle={{
              fontSize: 14,
              fontFamily: "Futura",
              letterSpacing: 2,
              margin: 2,
            }}
          />
          <ScrollView style={{ marginTop: 10 }}>{listItems}</ScrollView>
        </SafeAreaView>
      </PaperProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#BDCAE0",
  },
  card: {
    backgroundColor: "#BDCAE0",
    height: 120,
    marginLeft: 10,
    marginBottom: 5,
    marginTop: 5,
    marginRight: 10,
    padding: 0,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 10,
  },
  stockNameView: {
    position: "absolute",
    top: 20,
    left: 65,
  },
  stockName: {
    fontSize: 14,
    fontFamily: "Futura",
  },
  stockTicker: {
    color: "black",
    fontFamily: "Futura",
    letterSpacing: 2,
    fontWeight: "normal",
    textTransform: "uppercase",
    fontSize: 10,
    margin: 0,
  },
  priceView: {
    height: "50px",
    width: "50px",
    borderColor: "black",
    borderWidth: 2,
    position: "absolute",
    top: 5,
    right: 10,
  },
  price: {
    fontSize: 20,
    position: "absolute",
    top: 10,
    right: 10,
    // backgroundColor: "red",
    borderRadius: 10,
    color: "black",
    // paddingLeft: 5,
    // paddingRight: 5,
  },
  percentage: {
    fontSize: 10,
    position: "absolute",
    top: 35,
    right: 10,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 10,
    backgroundColor: "red",
  },
  green: {
    fontSize: 10,
    position: "absolute",
    top: 35,
    right: 10,
    color: "green",
  },
  red: {
    fontSize: 10,
    position: "absolute",
    top: 35,
    right: 10,
    color: "red",
  },
  text: {
    textAlign: "center",
    color: "whitesmoke",
    fontFamily: "Futura",
    letterSpacing: 2,
    fontSize: 20,
    marginTop: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  titleText: {
    color: "black",
    fontFamily: "Futura",
    letterSpacing: 2,
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 12,
    margin: 4,
  },
  image: {
    position: "absolute",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "gainsboro",
    resizeMode: "contain",
    height: 50,
    width: 50,
    margin: 10,

    backgroundColor: "white",
  },
});

const theme = {
  ...DefaultTheme,
  roundness: 5,
  colors: {
    ...DefaultTheme.colors,
    primary: "#222948",
    accent: "#f1c40f",
  },
};