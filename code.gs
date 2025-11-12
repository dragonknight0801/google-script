// SnapTrade API configuration (credentials and base URL)
const CLIENT_ID = "BA-TEST-PQURG";
const CONSUMER_KEY = "SHHHCqbkKvUwjmqNqYa06k2mqfDveGy93bJ85RTfCvGh317iDq"; // secret in API Key
const USER_ID = "snaptrader-user-bab";
const USER_SECRET = "a55c2e5f-bab3-4ee1-956e-833303bc1c4c";
const BASE_URL = "https://api.snaptrade.com";

// Covalent API configuration (credentials and base URL)
const COVALENT_KEY = "cqt_rQTxFVcqdtDjfGQXcJh9Xq9YYV43";
const COVALENT_BASE_URL = "https://api.covalenthq.com";

// Wallet configuration
const walletAddressesOnChain = [
  "solana-mainnet:DkwGTBw3M2ZtbKCz7o8vLDHmSMk1Pd5Prxo2AMxoxH6m",
  "btc-mainnet:bc1qjsgkhl2jey57ytkp8kvf5un9v8r552gargd37l"
];
const evmWalletAddress = ""; // Use this when evm wallet is ready

// Phantom Wallet configuration
const walletAddress = ""; // Deprecated now

// Sheet configuration
const SHEET_NAME = "Sheet1";
const SHEET_HEADER_ROW = 4;
const START_ROW_IN_TEMPLATE = 5;

/**
 * @description Generate the signature required to call the SnapTrade API.
 */
function getSnapTradeSignature(sigObject) {
  // Sort keys alphabetically and stringify
  function JSONstringifyOrder(obj) {
    const allKeys = [];
    const seen = {};
    JSON.stringify(obj, function(key, value) {
      if (!(key in seen)) {
        allKeys.push(key);
        seen[key] = null;
      }
      return value;
    });
    allKeys.sort();
    return JSON.stringify(obj, allKeys);
  }
  
  const sigContent = JSONstringifyOrder(sigObject);
  
  // Encode strings to byte arrays
  const signatureBytes = Utilities.computeHmacSha256Signature(sigContent, CONSUMER_KEY, Utilities.Charset.UTF_8);
  const base64Signature = Utilities.base64Encode(signatureBytes);

  // Logger.log("Signature: " + base64Signature);
  
  return base64Signature;
}

/**
 * @description Returns a list of all connections for the specified user.
 * @snapTradeEndpoint GET /api/v1/authorizations
 */
function listAllConnections() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const url = `${BASE_URL}/api/v1/authorizations?userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`;
  const sigObject = {
    content: null,
    path: "/api/v1/authorizations",
    query: `userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`
  };
  const signature = getSnapTradeSignature(sigObject);
  
  const options = {
    method: "get",
    headers: {
      "Signature": signature,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const connections = JSON.parse(response.getContentText());

  Logger.log("listAllConnections");
  Logger.log(JSON.stringify(connections));

  return connections;
}

/**
 * @description Trigger a holdings update for all accounts under this connection.
 * @snapTradeEndpoint POST /api/v1/authorizations/{authorizationId}/refresh
 */
function refreshHoldingsForAConnection(authorizationId) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const url = `${BASE_URL}/api/v1/authorizations/${authorizationId}/refresh?userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`;
  const sigObject = {
    content: null,
    path: `/api/v1/authorizations/${authorizationId}/refresh`,
    query: `userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`
  };
  const signature = getSnapTradeSignature(sigObject);
  
  const options = {
    method: "post",
    headers: {
      "Signature": signature,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  Logger.log(`refreshHoldingsForAConnection - ${authorizationId}`);
  Logger.log(response.getContentText());
}

/**
 * @description Returns all brokerage accounts across all connections known to SnapTrade for the authenticated user.
 * @snapTradeEndpoint GET /api/v1/accounts
 */
function listAccounts() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const url = `${BASE_URL}/api/v1/accounts?userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`;
  const sigObject = {
    content: null,
    path: "/api/v1/accounts",
    query: `userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`
  };
  const signature = getSnapTradeSignature(sigObject);
  
  const options = {
    method: "get",
    headers: {
      "Signature": signature,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const accounts = JSON.parse(response.getContentText());
  Logger.log("listAccounts");
  Logger.log(JSON.stringify(accounts));

  return accounts;
}

/**
 * @description Returns a list of balances, positions, and recent orders for the specified account.
 * @snapTradeEndpoint GET /api/v1/accounts/{accountId}/holdings
 */
function listAccountHoldings(accountId) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const url = `${BASE_URL}/api/v1/accounts/${accountId}/holdings?userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`;
  const sigObject = {
    content: null,
    path: `/api/v1/accounts/${accountId}/holdings`,
    query: `userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`
  };
  const signature = getSnapTradeSignature(sigObject);
  
  const options = {
    method: "get",
    headers: {
      "Signature": signature,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  Logger.log(`listAccountHoldings-${accountId}`);
  Logger.log(response.getContentText());
}

/**
 * @description Returns a list of stock/ETF/crypto/mutual fund positions in the specified account.
 * @snapTradeEndpoint GET /api/v1/accounts/{accountId}/positions
 */
function listAccountPositions(accountId) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const url = `${BASE_URL}/api/v1/accounts/${accountId}/positions?userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`;
  const sigObject = {
    content: null,
    path: `/api/v1/accounts/${accountId}/positions`,
    query: `userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`
  };
  const signature = getSnapTradeSignature(sigObject);
  
  const request = {
    url,
    method: "get",
    headers: {
      "Signature": signature,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };

  return request;
}

/**
 * @description Returns a list of option positions in the specified account.
 * @snapTradeEndpoint GET /api/v1/accounts/{accountId}/options
 */
function listAccountOptionPositions(accountId) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const url = `${BASE_URL}/api/v1/accounts/${accountId}/options?userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`;
  const sigObject = {
    content: null,
    path: `/api/v1/accounts/${accountId}/options`,
    query: `userId=${USER_ID}&userSecret=${USER_SECRET}&clientId=${CLIENT_ID}&timestamp=${timestamp}`
  };
  const signature = getSnapTradeSignature(sigObject);
  
  const request = {
    url,
    method: "get",
    headers: {
      "Signature": signature,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };

  return request;
}

/**
 * @description Returns a list of regular and option positions for the specified account.
 */
function listAccountAllPositions(accountId) {
  
  const responses = UrlFetchApp.fetchAll([
    listAccountPositions(accountId),
    listAccountOptionPositions(accountId),
  ]);

  Logger.log(`listAccountPositions-${accountId}`);
  const positions = JSON.parse(responses[0].getContentText());
  Logger.log(JSON.stringify(positions));

  Logger.log(`listAccountOptionPositions-${accountId}`);
  const options = JSON.parse(responses[1].getContentText());
  Logger.log(JSON.stringify(options));

  return {
    positions,
    options
  };
}

/**
 * @description Fetch data from snapTrade.
 */
function getSnapTradeFeedData() {
  const feedData = [];

  // 1. Get all connections
  const connections = listAllConnections();
  // 2. For each connection, trigger a "holding update" to get latest data
  connections.forEach(({ id, brokerage, name }) => {
    Logger.log(`Refreshing "${brokerage.name}->${name}" connection...`)
    refreshHoldingsForAConnection(id); // Here, id is authorizationId
  });

  // 3. Get a list of linked brokers
  const accounts = listAccounts();

  const summarizedData = {};

  // 4. Get position status
  accounts.forEach(({ id, name, number, meta: { accountId } }) => {
    const { positions, options } = listAccountAllPositions(id);

    positions.forEach(({ symbol: { symbol: { symbol } }, price, open_pnl, units, average_purchase_price }) => {
      // To improve readability, make variables for every Excel cell.
      const Asset = symbol;
      const DataPurchased = "";
      const Platform = name;
      const AccountNumber = accountId ?? number;
      const Type = "Spot";
      const PositionType = ((price > average_purchase_price) && (open_pnl > 0)) || ((price < average_purchase_price) && (open_pnl < 0)) ? "Long" : "Short";
      const Quantity = units.toString();
      const LastPrice = price;
      const totalValue = units * price;
      const TotalValue = totalValue.toString();
      const PricePaid = average_purchase_price;
      const TotalCost = "$" + (units * average_purchase_price).toString();
      const TotalGain = open_pnl ? open_pnl.toString() : "";
      const TotalGainPercent = (open_pnl / (units * average_purchase_price) * 100).toFixed(2).toString() + "%";
      const Notes = "";

      feedData.push([
        Asset, DataPurchased, Platform, AccountNumber, Type, PositionType, Quantity, LastPrice, TotalValue, PricePaid, TotalCost, TotalGain, TotalGainPercent, Notes
      ]);
      if (totalValue) {
        summarizedData[Asset] = summarizedData[Asset] == null ? totalValue : summarizedData[Asset] + totalValue;
      }
    });

    options.forEach(({ symbol: { option_symbol: { ticker, underlying_symbol: { symbol: underlyingSymbol } } }, price, units, average_purchase_price }) => {
      // To improve readability, make variables for every Excel cell.
      const Asset = ticker;
      const DataPurchased = "";
      const Platform = name;
      const AccountNumber = accountId ?? number;
      const Type = "Option";
      const PositionType = units > 0 ? "Long" : "Short";
      const Quantity = units.toString();
      const LastPrice = price;
      const totalValue = units * price * 100;
      const TotalValue = totalValue.toString();
      const PricePaid = average_purchase_price / 100;
      const TotalCost = "$" + (units * average_purchase_price).toString();
      const open_pnl = (price - average_purchase_price / 100) * 100 * units;
      const TotalGain = open_pnl ? open_pnl.toString() : "";
      const TotalGainPercent = (open_pnl / (units * average_purchase_price) * 100).toFixed(2).toString() + "%";
      const Notes = "";

      feedData.push([
        Asset, DataPurchased, Platform, AccountNumber, Type, PositionType, Quantity, LastPrice, TotalValue, PricePaid, TotalCost, TotalGain, TotalGainPercent, Notes
      ]);
      if (totalValue) {
        summarizedData[underlyingSymbol] = summarizedData[underlyingSymbol] == null ? totalValue : summarizedData[underlyingSymbol] + totalValue;
      }
    });
  });

  return [feedData, summarizedData];
}

/**
 * @description Formats a token balance using its decimal precision.
 */
function formatTokenBalance(balanceStr, decimals) {
  if (balanceStr.length <= decimals) {
    // pad with zeros on the left if needed
    balanceStr = balanceStr.padStart(decimals + 1, "0");
  }

  var quantity = balanceStr.slice(0, -decimals) + "." + balanceStr.slice(-decimals);
  quantity = quantity.replace(/^0+(?=\d)/, '');  // remove leading zeros safely

  return quantity;
}

/**
 * @description Get multichain balances using covalent api.
 */
function getMultichainBalances() {
  const feedData = [];

  const url = `${COVALENT_BASE_URL}/v1/allchains/address/${evmWalletAddress}/balances/?key=${COVALENT_KEY}`;

  let items = [];
  try {
    const response = UrlFetchApp.fetch(url);
    items = JSON.parse(response.getContentText()).data.items || [];
  } catch (error) {
    Logger.log("❌ Covalent API call failed: " + error.message);

    return [[], []];
  }

  const summarizedData = {};

  // 4. Get position status
  items.forEach(({ contract_ticker_symbol, contract_decimals, balance, quote, quote_rate, chain_display_name }) => {
    if (!quote) return;
    const Asset = contract_ticker_symbol;
    const DataPurchased = "";
    const Platform = chain_display_name.toLowerCase().endsWith("mainnet") ? chain_display_name.replace(/\s*mainnet$/i, '') : chain_display_name;
    const AccountNumber = evmWalletAddress;
    const Type = "Spot";
    const PositionType = "";
    const Quantity = formatTokenBalance(balance, contract_decimals);
    const LastPrice = quote_rate;
    const TotalValue = quote.toString();
    const PricePaid = "";
    const TotalCost = "";
    const TotalGain = "";
    const TotalGainPercent = "";
    const Notes = "";

    feedData.push([
      Asset, DataPurchased, Platform, AccountNumber, Type, PositionType, Quantity, LastPrice, TotalValue, PricePaid, TotalCost, TotalGain, TotalGainPercent, Notes
    ]);
    summarizedData[Asset] = summarizedData[Asset] == null ? quote : summarizedData[Asset] + quote;
  });

  return [feedData, summarizedData];
}

/**
 * @description Get token balances using covalent api.
 */
function getWalletBalancesOnChain(walletAddress) {
  const feedData = [];

  const parts = walletAddress.split(":", 2);
  const chainIdentifier = parts[0];
  const address = parts[1];
  if (!Object.keys(GoldRushSupportedNetworks).includes(chainIdentifier) || !address) {
    Logger.log("❌ Invalid wallet address format: " + walletAddress);

    return [[], []]
  }

  const url = `${COVALENT_BASE_URL}/v1/${chainIdentifier}/address/${address}/balances_v2/?key=${COVALENT_KEY}`;

  let items = [];
  try {
    const response = UrlFetchApp.fetch(url);
    items = JSON.parse(response.getContentText()).data.items || [];
    Logger.log(`Wallet-${walletAddress}-balances`);
    Logger.log(JSON.stringify(items));
  } catch (error) {
    Logger.log("❌ Covalent API call failed: " + error.message);

    return [[], []];
  }

  const summarizedData = {};

  // 4. Get position status
  items.forEach(({ contract_ticker_symbol, contract_address, contract_decimals, balance, quote, quote_rate }) => {
    if (!quote) return;
    const Asset = contract_ticker_symbol ?? myBlueChipTokens[contract_address]?.symbol;
    const DataPurchased = "";
    const Platform = GoldRushSupportedNetworks[chainIdentifier];
    const AccountNumber = address;
    const Type = stakedSOL.includes(Asset ? Asset.toLowerCase() : "") ? "Staked" : "Spot";
    const PositionType = "";
    const Quantity = formatTokenBalance(balance, contract_decimals);
    const LastPrice = quote_rate;
    const TotalValue = quote.toString();
    const PricePaid = "";
    const TotalCost = "";
    const TotalGain = "";
    const TotalGainPercent = "";
    const Notes = "";

    feedData.push([
      Asset, DataPurchased, Platform, AccountNumber, Type, PositionType, Quantity, LastPrice, TotalValue, PricePaid, TotalCost, TotalGain, TotalGainPercent, Notes
    ]);
    let symbol1 = Asset;
    if (Type == "Staked") {
      symbol1 = "SOL";
    }
    summarizedData[symbol1] = summarizedData[symbol1] == null ? quote : summarizedData[symbol1] + quote;
  });

  return [feedData, summarizedData];
}

function getMultiWalletBalancesOnChain(walletAddresses) {
  let overallFeedData = [];
  const overallSummarizedData = {};
  for (let i = 0; i < walletAddresses.length; i++) {
    const [feedData, summarizedData] = getWalletBalancesOnChain(walletAddresses[i]);
    overallFeedData = [...overallFeedData, ...feedData];
    Object.keys(summarizedData).forEach((asset) => {
      overallSummarizedData[asset] = overallSummarizedData[asset] ? overallSummarizedData[asset] + summarizedData[asset] : summarizedData[asset];
    });
  }

  return [overallFeedData, overallSummarizedData];
}

/**
 * @description Fetch solana token balances.
 */
function getSolanaTokenBalances() {
  try {
    // 1. Get balance of SOL and tokens in wallet
    const solBalanceResponse = UrlFetchApp.fetch("https://api.mainnet-beta.solana.com", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [
          walletAddress
        ]
      })
    });
    const tokenAccountsResponse = UrlFetchApp.fetch("https://api.mainnet-beta.solana.com", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          walletAddress,
          { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
          { commitment: "finalized", encoding: "jsonParsed" }
        ]
      })
    });

    const solBalance = JSON.parse(solBalanceResponse.getContentText()).result?.value / 1000000000;
    const tokenAccountsData = JSON.parse(tokenAccountsResponse.getContentText()).result?.value || [];

    // 2. Get all Phantom tokens info (for symbol, decimals)
    const phantomTokens = [];
    let lastAddress = "";
    for (let i = 0; i < 2; i++) {
      const tokenFetchUrl = "https://api.phantom.app/search/v1?query=&chainIds=solana%3A101&pageSize=100&searchTypes=fungible&searchContext=explore";
      const phantomTokensResponse = UrlFetchApp.fetch(
        !lastAddress ?
          tokenFetchUrl :
          `${tokenFetchUrl}&cursor=direction%3Ddown%2ClastTradingVolume%3D64708791%2ClastChainId%3Dsolana%3A101%2ClastAddress%3D${lastAddress}`
      );
      const result = JSON.parse(phantomTokensResponse.getContentText()).results || [];
      phantomTokens.push(...result);
      if (result.length) {
        lastAddress = result[result.length - 1].data?.data?.mintAddress;
      }
    }

    // Map mint address to token info
    const mintMap = {};
    phantomTokens.forEach(t => {
      if (t.data?.data?.mintAddress) {
        mintMap[t.data.data.mintAddress] = {
          symbol: t.data.data.symbol,
          decimals: t.data.data.decimals
        };
      }
    });

    // 3. Prepare tokens array for price API
    const tokensForPrice = [];
    const tokenBalances = [{
      balance: solBalance,
      symbol: "SOL"
    }];

    tokenAccountsData.forEach(account => {
      const info = account.account.data.parsed.info;
      const balance = parseFloat(info.tokenAmount.uiAmount);
      const decimals = parseFloat(info.tokenAmount.decimals);
      const mint = info.mint;
      if (balance > 0 && decimals > 0 && (mintMap[mint] || myBlueChipTokens[mint])) {
        const tokenInfo = mintMap[mint] || myBlueChipTokens[mint];
        tokenBalances.push({
          mint: mint,
          balance: balance,
          symbol: tokenInfo.symbol
        });
        tokensForPrice.push({
          token: {
            chainId: "solana:101",
            address: mint,
            resourceType: "address"
          }
        });
      }
    });

    // Include native SOL
    tokensForPrice.push({
      token: {
        chainId: "solana:101",
        resourceType: "nativeToken",
        slip44: "501"
      }
    });

    // 4. Get prices
    const pricesResponse = UrlFetchApp.fetch("https://api.phantom.app/price/v1", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ tokens: tokensForPrice })
    });

    const pricesData = JSON.parse(pricesResponse.getContentText()).prices || [];

    // Map mint to price
    const priceMap = {};
    Object.keys(pricesData).forEach(key => {
      const address = key.split(":")[2]; 
      if (address === "501") priceMap["SOL"] = pricesData[key].price;
      else priceMap[address] = pricesData[key].price;
    });

    const results = [];
    const summarizedData = {};
    tokenBalances.forEach(t => {
      const price = t.symbol === "SOL" ? priceMap["SOL"] : priceMap[t.mint] || 0;
      const value = t.balance * price;

      const Asset = t.symbol;
      const DataPurchased = "";
      const Platform = "Phantom";
      const AccountNumber = walletAddress;
      const Type = stakedSOL.includes(Asset ? Asset.toLowerCase() : "") ? "Staked" : "Spot";
      const PositionType = "";
      const Quantity = t.balance.toString();
      const LastPrice = price;
      const TotalValue = value.toString();
      const PricePaid = "";
      const TotalCost = "";
      // const open_pnl = "";
      const TotalGain = "";
      const TotalGainPercent = "";
      const Notes = "";

      results.push([
        Asset, DataPurchased, Platform, AccountNumber, Type, PositionType, Quantity, LastPrice, TotalValue, PricePaid, TotalCost, TotalGain, TotalGainPercent, Notes
      ]);

      let symbol1 = Asset;
      if (Type == "Staked") {
        symbol1 = "SOL";
      }
      summarizedData[symbol1] = summarizedData[symbol1] == null ? value : summarizedData[symbol1] + value;
    });

    return [results, summarizedData];
  } catch (error) {
    Logger.log("❌ Phantom API call failed: " + error.message);
  }

  return [[], []];
}

function clearSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  const LastRowInTemplate = 18;
  const totalRows = sheet.getMaxRows();
  if (totalRows > LastRowInTemplate) {
    sheet.deleteRows(LastRowInTemplate + 1, totalRows - LastRowInTemplate);
  }

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow > SHEET_HEADER_ROW) {
    // Only clear content below header (keep formatting & dropdowns)
    sheet.getRange(SHEET_HEADER_ROW + 1, 1, lastRow - SHEET_HEADER_ROW, lastColumn).clearContent();
  }
}

function createPieChart(length, pos) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  // Remove old charts
  const charts = sheet.getCharts();
  charts.forEach(chart => sheet.removeChart(chart));

  const assetRange = sheet.getRange(`Q5:Q${5 + length - 1}`);  // Asset names
  const valueRange = sheet.getRange(`R5:R${5 + length - 1}`);  // Total values

  // Build the chart
  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.PIE)  // Circle chart
    .addRange(assetRange)
    .addRange(valueRange)
    .setPosition(5 + pos + 10, 7, 0, 0)
    .setOption("title", "Portfolio Allocation")
    .setOption("pieHole", 0)
    .setOption("width", 300)
    .setOption("height", 240)
    .build();

  // Insert chart into sheet
  sheet.insertChart(chart);
}

function main() {
  const startTime = new Date().getTime();

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  clearSheet();
  const [snapTradeFeed, snapTradeSummaryData] = getSnapTradeFeedData();
  const [trustWalletData, trustWalletSummaryData] = getMultiWalletBalancesOnChain(walletAddressesOnChain);

  const feedData = [...snapTradeFeed, ...trustWalletData];
  const summaryData = [];

  let sum = 0;
  Object.keys(snapTradeSummaryData).forEach(key => {
    summaryData.push([key, snapTradeSummaryData[key]]);
    sum += snapTradeSummaryData[key];
  });
  Object.keys(trustWalletSummaryData).forEach(key => {
    summaryData.push([key, trustWalletSummaryData[key]]);
    sum += trustWalletSummaryData[key];
  });
  summaryData.push(["SUM", sum]);

  sheet.getRange(START_ROW_IN_TEMPLATE, 1, feedData.length, feedData[0].length).setValues(feedData);
  feedData.forEach((rowData, index) => {
    const open_pnl = Number.parseFloat(rowData[11]);
    if (open_pnl > 0) {
      sheet.getRange(START_ROW_IN_TEMPLATE + index, 12).setFontColor("green");
      sheet.getRange(START_ROW_IN_TEMPLATE + index, 13).setFontColor("green");
    } else {
      sheet.getRange(START_ROW_IN_TEMPLATE + index, 12).setFontColor("red");
      sheet.getRange(START_ROW_IN_TEMPLATE + index, 13).setFontColor("red");
    }
  });

  sheet.getRange(START_ROW_IN_TEMPLATE, 17, summaryData.length, 2).setValues(summaryData);

  // Draw chart
  createPieChart(summaryData.length - 1, feedData.length);

  const endTime = new Date().getTime();  
  Logger.log(`Run Time: ${(endTime - startTime) / 1000.0}s`);
}

