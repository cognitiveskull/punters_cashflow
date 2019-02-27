const {UNABLE_TO_DO_CHARITY_MSG} = require("./constant");

const startGame = function(req, res) {
  req.game.startGame();
  res.end();
};

const getGame = function(req, res) {
  const {playerName} = req.cookies;
  const game = req.game;
  const {currentPlayer} = game;
  if (currentPlayer.isDownSized()) {
    game.skipTurn();
  }
  game.requester = game.getPlayerByName(playerName);
  game.isMyTurn = game.isCurrentPlayer(playerName);
  console.log(game);
  res.send(JSON.stringify(game));
};

const getPlayersFinancialStatement = function(req, res) {
  const {playerName} = req.cookies;
  const requiredPlayer = req.game.getPlayerByName(playerName);
  res.send(JSON.stringify(requiredPlayer));
};

const rollDice = function(req, res) {
  const {numberOfDice} = req.body;
  const {playerName} = req.cookies;
  const game = req.game;
  const {currentPlayer} = game;
  if (currentPlayer.isDownSized()) {
    game.skipTurn();
    res.json({diceValues: [null]});
    return;
  }
  if (!game.isCurrentPlayer(playerName) || currentPlayer.rolledDice) {
    res.json({diceValues: [null]});
    return;
  }
  const currentSpaceDetails = req.game.rollDice(numberOfDice);
  res.json(currentSpaceDetails);
};

const acceptCharity = function(req, res) {
  req.game.acceptCharity();
  const ledgerBalance = req.game.currentPlayer.getLedgerBalance();
  req.game.nextPlayer();
  res.send(JSON.stringify({ledgerBalance}));
};

const declineCharity = function(req, res) {
  req.game.declineCharity();
  req.game.nextPlayer();
  res.end();
};

const selectSmallDeal = function(req, res) {
  req.game.handleSmallDeal();
  res.end();
};

const selectBigDeal = function(req, res) {
  req.game.handleBigDeal();
  res.end();
};

const grantLoan = function(req, res) {
  const {playerName} = req.cookies;
  const loanAmount = +req.body.amount;
  const game = req.game;
  game.grantLoan(playerName, loanAmount);
  const player = game.getPlayerByName(playerName);
  res.send(JSON.stringify(player));
};

const payDebt = function(req, res) {
  const {playerName} = req.cookies;
  const debtDetails = req.body;
  const game = req.game;
  game.payDebt(playerName, debtDetails);
  const player = game.getPlayerByName(playerName);
  res.send(JSON.stringify(player));
};

const sellAssets = function(req, res) {
  const { playerName } = req.cookies;
  const assetNames = req.body.selectedAsset;
  const game = req.game;
  game.soldAsset(playerName, assetNames);
  const player = game.getPlayerByName(playerName);
  res.send(JSON.stringify(player));
};

const provideLiabilities = function(req, res) {
  const {playerName} = req.cookies;
  const game = req.game;
  const player = game.getPlayerByName(playerName);
  res.send(JSON.stringify(player));
};

const isAbleToDoCharity = function(req, res) {
  const isAble = req.game.currentPlayer.isAbleToDoCharity();
  if (!isAble) req.game.currentPlayer.setNotification(UNABLE_TO_DO_CHARITY_MSG);
  res.send(JSON.stringify({isAble}));
};

const acceptSmallDeal = function(req, res) {
  const {activeCard} = req.game;
  let isSuccessful = true;
  if (activeCard.data.relatedTo == "realEstate") {
    isSuccessful = req.game.currentPlayer.addRealEstate(activeCard.data);
  }
  if (activeCard.data.relatedTo == "goldCoins") {
    isSuccessful = req.game.currentPlayer.buyGoldCoins(activeCard.data);
  }
  if (!isSuccessful) return res.json({ isSuccessful });
  let requestedPlayer = req.cookies["playerName"];
  req.game.addActivity(`${requestedPlayer} has accepted the deal`);
  req.game.nextPlayer();
  res.json({ isSuccessful });
};

const rejectSmallDeal = function(req, res) {
  let requestedPlayer = req.cookies["playerName"];
  req.game.addActivity(`${requestedPlayer} has rejected the deal`);
  req.game.nextPlayer();
  res.end();
};

const acceptBigDeal = function(req, res) {
  const {activeCard} = req.game;
  const isSuccessful = req.game.currentPlayer.addRealEstate(activeCard.data);
  if (!isSuccessful) return res.send({isSuccessful});
  let requestedPlayer = req.cookies["playerName"];
  req.game.addActivity(`${requestedPlayer} has accepted the deal`);
  req.game.nextPlayer();
  res.send({ isSuccessful });
};

const rejectBigDeal = function(req, res) {
  let requestedPlayer = req.cookies["playerName"];
  req.game.addActivity(`${requestedPlayer} has rejected the deal`);
  req.game.nextPlayer();
  res.end();
};

const hasCharity = function(req, res) {
  const {playerName} = req.cookies;
  const game = req.game;
  if (!game.isCurrentPlayer(playerName)) {
    res.send(JSON.stringify({hasCharityTurns: false}));
    return;
  }
  const hasCharityTurns = req.game.hasCharityTurns();
  res.send(JSON.stringify({hasCharityTurns}));
};

const isSharePresent = function(req, res) {
  const {playerName} = req.cookies;
  const hasShares = req.game.hasShares(playerName);
  res.json({hasShares});
};

const buyShares = function(req, res) {
  let {numberOfShares} = req.body;
  const isCapable = req.game.isPlayerCapableToBuy(numberOfShares);
  if (isCapable) {
    req.game.buyShares(numberOfShares);
  }
  res.json({isCapable});
};

const sellShares = function(req, res) {
  const {playerName} = req.cookies;
  let {numberOfShares} = req.body;
  const isCapable = req.game.isPlayerCapableToSell(playerName, numberOfShares);
  if (isCapable) {
    req.game.sellShares(playerName, numberOfShares);
  }
  res.json({isCapable});
};

const completeTurn = function(req, res) {
  const {playerName} = req.cookies;
  const player = req.game.getPlayerByName(playerName);
  player.completeTurn();
  if (req.game.isPlayersTurnCompleted()) req.game.nextPlayer();
  res.end();
};

const sellEstate = function(req, res) {
  const estate = req.body;
  const game = req.game;
  const marketCard = game.activeCard;
  const {playerName} = req.cookies;
  const player = req.game.getPlayerByName(playerName);
  const profit = player.sellEstate(estate, marketCard);
  game.addActivity(` sold Real Estate for $${profit} `, playerName);
  res.end();
};

const provideCommonEstates = function(req, res) {
  const {playerName} = req.cookies;
  const commonEstates = req.game.getCommonEstates(playerName);
  res.send(JSON.stringify(commonEstates));
};

const sellGoldCoins = function(req, res) {
  const { cost, numberOfCoins } = req.body;
  const game = req.game;
  const { playerName } = req.cookies;
  const player = game.getPlayerByName(playerName);
  game.addActivity(` sold ${numberOfCoins} at rate of ${cost}`, playerName);
  player.sellGoldCoins(numberOfCoins, cost);
  res.end();
};

const hasShares = function(req, res) {
  const { symbol } = req.body;
  const game = req.game;
  const hasShares = game.hasAnyoneShares(symbol);
  res.send(JSON.stringify({ hasShares }));
};

const rollDiceForSplitReverse = function (req, res) {
  const { symbol } = req.body;
  const game = req.game;
  const diceValue = game.rollDiceForSplitReverse(symbol);
  res.send(JSON.stringify(diceValue));
}

const createAuction = function(req, res) {
  const {basePrice} = req.body;
  const {playerName} = req.cookies;
  const isSuccessful = req.game.createAuction(playerName, basePrice);
  console.log(req.game.currentAuction.data);
  res.json({isSuccessful, playerName, basePrice});
};

const bid = function(req, res) {
  const {playerName} = req.cookies;
  const {currentBid} = req.body;
  const bidData = req.game.handleBid(playerName, currentBid);
  res.json(bidData);
};

const passBid = function(req, res) {
  const {playerName} = req.cookies;
  req.game.passBid(playerName);
  res.json({message: "", isAbleToBid: false});
};

const handleBid = function(req, res) {
  const {wantToBid} = req.body;
  if (wantToBid) return bid(req, res);
  passBid(req, res);
};

const closeAuction = function(req, res) {
  req.game.closeAuction();
  res.json({message: ""});
};

const handleAuction = function(req, res) {
  const {action} = req.body;
  if (action) return createAuction(req, res);
  closeAuction(req, res);
};

module.exports = {
  getGame,
  startGame,
  getPlayersFinancialStatement,
  acceptCharity,
  declineCharity,
  selectBigDeal,
  selectSmallDeal,
  grantLoan,
  payDebt,
  isAbleToDoCharity,
  provideLiabilities,
  acceptSmallDeal,
  rejectSmallDeal,
  buyShares,
  acceptBigDeal,
  rejectBigDeal,
  hasCharity,
  rollDice,
  isSharePresent,
  sellShares,
  completeTurn,
  sellEstate,
  provideCommonEstates,
  sellGoldCoins,
  sellAssets,
  hasShares,
  rollDiceForSplitReverse,
  handleAuction,
  handleBid
};
