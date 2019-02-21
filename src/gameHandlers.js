const Game = require("./model/game");
const Cards = require("./model/cards");
const Player = require("./model/player");
const cards = require("../data/cards");

const { randomNum } = require("./utils/utils");

const initializeGame = function(host) {
  const bigDeals = new Cards(cards.bigDeals);
  const smallDeals = new Cards(cards.smallDeals);
  const market = new Cards(cards.market);
  const doodads = new Cards(cards.doodads);
  const professions = new Cards(cards.professions);
  return new Game({ bigDeals, smallDeals, market, doodads, professions }, host);
};

const hostGame = function(req, res) {
  const { playerName } = req.body;
  const game = initializeGame(playerName);
  const player = new Player(playerName);
  const gameId = res.app.createGameId();
  game.addPlayer(player);
  res.app.games[gameId] = game;
  res.cookie("gameId", gameId);
  res.cookie("playerName", playerName);
  res.redirect("/waiting.html");
};

const provideGameLobby = function(req, res) {
  const players = req.game.getPlayerNames();
  const { gameId, playerName } = req.cookies;
  const isHost = req.game.host == playerName;
  const hasStarted = req.game.hasStarted;
  res.send(JSON.stringify({ players, gameId, isHost, hasStarted }));
};

const joinGame = function(req, res) {
  const { gameId, playerName } = req.body;
  const player = new Player(playerName);
  const game = res.app.games[gameId];
  game.addPlayer(player);
  res.cookie("gameId", gameId);
  res.cookie("playerName", playerName);
  res.redirect("/waiting.html");
};

const startGame = function(req, res) {
  req.game.getInitialDetails();
  req.game.hasStarted = true;
  res.end();
};

const doesGameExist = function(allGames, gameId) {
  return Object.keys(allGames).includes(gameId);
};

const sendGameNotFound = function(res) {
  const error = "Sorry! No Game with this Id..";
  const isGameJoinable = false;
  res.send(JSON.stringify({ error, isGameJoinable }));
};

const sendGameStarted = function(res) {
  const error = "Sorry! The Game has already started..";
  const isGameJoinable = false;
  res.send(JSON.stringify({ error, isGameJoinable }));
};

const sendPlaceNotAvailable = function(res) {
  const error = "Sorry! No place available in the Game..";
  const isGameJoinable = false;
  res.send(JSON.stringify({ error, isGameJoinable }));
};

const canJoin = function(req, res) {
  const { gameId } = req.body;
  const allGames = res.app.games;
  const game = allGames[gameId];
  if (!doesGameExist(allGames, gameId)) return sendGameNotFound(res);
  const hasStarted = game.hasStarted;
  const isPlaceAvailable = game.isPlaceAvailable();

  if (hasStarted) return sendGameStarted(res);
  if (!isPlaceAvailable) return sendPlaceNotAvailable(res);

  res.send(JSON.stringify({ isGameJoinable: true }));
};

const getPlayers = function(req, res) {
  res.send(JSON.stringify(req.game.players));
};

const isCurrentPlayer = function(req) {
  let { name } = req.game.currentPlayer;
  return name == req.cookies["playerName"];
};

const getGame = function(req, res) {
  req.game.isMyTurn = isCurrentPlayer(req);
  res.send(JSON.stringify(req.game));
};

const getPlayer = function(currentPlayer, player) {
  return player.name == currentPlayer;
};

const getPlayersFinancialStatement = function(req, res) {
  let currentPlayer = req.cookies["playerName"];
  let getRequiredPlayer = getPlayer.bind(null, currentPlayer);
  let requiredPlayer = req.game.players.filter(getRequiredPlayer)[0];
  res.send(JSON.stringify(requiredPlayer));
};

const rollDie = function(req, res) {
  let { currentPlayer, board } = req.game;
  let { currentSpace } = currentPlayer;
  if (!isCurrentPlayer(req) || currentPlayer.rolledDice) {
    res.json({ diceValue: null });
    return;
  }
  currentPlayer.deactivateDice();
  const diceValue = randomNum(6);
  const rolledDieMsg = " rolled " + diceValue;
  currentPlayer.move(diceValue);
  req.game.addActivity(rolledDieMsg, currentPlayer.name);
  const spaceType = board.getSpaceType(currentPlayer.currentSpace);
  const currentSpaceDetails = { diceValue, spaceType };
  currentPlayer.rolledDice = true;
  currentPlayer.didUpdateSpace = true;
  res.json(currentSpaceDetails);
  req.game.handleSpace(currentSpace);
};

const acceptCharity = function(req, res) {
  let { currentPlayer } = req.game;
  if (currentPlayer.gotCharitySpace) {
    currentPlayer.ledgerBalance -= currentPlayer.totalIncome / 10;
    currentPlayer.charityTurns = 3;
    currentPlayer.gotCharitySpace = false;
    req.game.nextPlayer();
  }
  res.end();
};

const declineCharity = function(req, res) {
  req.game.nextPlayer();
  res.end();
};

const selectSmallDeal = function(req, res) {
  let { currentPlayer } = req.game;
  if (currentPlayer.gotDeal) {
    req.game.handleSmallDeal();
    currentPlayer.gotDeal = false;
  }
  res.end();
};

const selectBigDeal = function(req, res) {
  let { currentPlayer } = req.game;
  if (currentPlayer.gotDeal) {
    req.game.handleBigDeal();
    currentPlayer.gotDeal = false;
  }
  res.end();
};

module.exports = {
  hostGame,
  provideGameLobby,
  getPlayers,
  joinGame,
  getGame,
  startGame,
  getPlayersFinancialStatement,
  canJoin,
  rollDie,
  acceptCharity,
  declineCharity,
  selectBigDeal,
  selectSmallDeal
};
