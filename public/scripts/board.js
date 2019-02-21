const closeOverlay = function(id) {
  let overlay = document.getElementById(id);
  overlay.style.visibility = "hidden";
};

const openFinancialStatement = function() {
  let fs = document.getElementById("financial_statement");
  fs.style.visibility = "visible";
};

const getName = function() {
  return document.cookie.split(";")[0].split("=")[1];
};

const openCashLedger = function() {
  let fs = document.getElementById("cash_ledger");
  fs.style.visibility = "visible";
};

const getBoard = function() {
  let container = document.getElementById("container");
  let parent = container.parentElement;
  parent.removeChild(container);
};

const setCashLedger = function(player) {
  setInnerText("LedgerBalance", player.ledgerBalance);
  setInnerText("ledger-balance", player.ledgerBalance);
};

const getCashLedger = function() {
  const container = document.getElementById("container");
  container.innerHTML = "";
  const top = document.createElement("div");
  const leftSection = document.createElement("section");
  leftSection.className = "popup";
  top.className = "statements";
  fetch("/financialStatement")
    .then(data => data.json())
    .then(content => {
      setCashLedger(content);
      const button = createPopupButton("continue", getBoard);
      const cashLedger = document.getElementById("cash_ledger");
      top.innerHTML = cashLedger.innerHTML;
      appendChildren(container, [top, button]);
    });
};

const updateStatementBoard = function(player) {
  setInnerText("name", player.name);
  setInnerText("Profession", player.profession);
  setInnerText("passiveIn", player.passiveIncome);
  setInnerText("totalIn", player.totalIncome);
  setInnerText("expenses", player.totalExpense);
  setInnerText("cashflow", player.cashflow);
  setInnerText("income", player.income.salary);
  setInnerText("ledger-balance", player.ledgerBalance);
  return player;
};

const setFinancialStatement = function(player) {
  setInnerText("player_salary", player.income.salary);
  setInnerText("player_passiveIn", player.passiveIncome);
  setInnerText("player_totalIn", player.totalIncome);
  setInnerText("player_expenses", player.totalExpense);
  setInnerText("player_cashflow", player.cashflow);
  setInnerText("player_name", `Name : ${player.name}`);
  setInnerText("player_profession", `Profession : ${player.profession}`);
  setInnerText(
    "player_liabilities",
    `Liabilities :` + createParagraph(player.liabilities)
  );
  setInnerText(
    "player_expense",
    `Expense :` + createParagraph(player.expenses)
  );
  setInnerText("player_income", `Income :` + createParagraph(player.income));
  setInnerText("player_assets", `assets :` + createParagraph(player.assets));
  updateStatementBoard(player);
};

const createFinancialStatement = function() {
  const container = document.getElementById("container");
  container.innerHTML = "";
  const top = document.createElement("div");
  const leftSection = document.createElement("section");
  leftSection.className = "popup";
  top.className = "statements";
  fetch("/financialStatement")
    .then(data => data.json())
    .then(player => {
      setFinancialStatement(player);
      const button = createPopupButton("continue", getCashLedger);
      const fs = document.getElementById("financial_statement");
      top.innerHTML = fs.innerHTML;
      appendChildren(container, [top, button]);
    });
};

const gamePiece = {
  1: "player1",
  2: "player2",
  3: "player3",
  4: "player4",
  5: "player5",
  6: "player6"
};

const getProfessionsDiv = function(player) {
  let { name, turn } = player;
  let mainDiv = createDivWithClass("details");
  let container = document.getElementById("container");
  let playerName = createDiv(`Name : ${name}`);
  let playerProfession = createDiv(`Profession : ${player.profession}`);
  let playerTurn = createDiv(`Turn : ${turn}`);
  let playerGamePiece = createDivWithClass(gamePiece[turn]);
  playerGamePiece.classList.add("gamePiece");
  appendChildren(mainDiv, [
    playerName,
    playerProfession,
    playerTurn,
    playerGamePiece
  ]);
  container.appendChild(mainDiv);
};

const getProfessions = function() {
  fetch("/getgame")
    .then(data => {
      return data.json();
    })
    .then(content => {
      let players = content.players;
      let container = document.getElementById("container");
      players.map(getProfessionsDiv).join("");
      let button = createPopupButton("continue", createFinancialStatement);
      container.appendChild(button);
    });
};

const createTextDiv = function(text) {
  const textDiv = document.createElement("div");
  const textPara = document.createElement("p");
  textPara.innerText = text;
  textDiv.appendChild(textPara);
  return textDiv;
};

const doCharity = function() {
  closeOverlay("askCharity");
  hideCardOverLay();
  fetch("/acceptCharity")
    .then(res => res.json())
    .then(charityDetail => {
      const ledgerBalance = getElementById("ledger-balance");
      ledgerBalance.innerText = charityDetail.ledgerBalance;
    });
};

const acceptCharity = function() {
  fetch("/isabletodocharity")
    .then(res => res.json())
    .then(({ isAble, msg }) => {
      const msgContainer = getElementById("notification");
      msgContainer.innerText = msg;
      if (isAble) doCharity();
    });
};

const declineCharity = function() {
  closeOverlay("askCharity");
  hideCardOverLay();
  fetch("/declineCharity");
};

const createSharesSmallDeal = function(card) {
  const { title, message, symbol, historicTradingRange, currentPrice } = card;
  const cardDiv = document.getElementById("card");
  cardDiv.style.visibility = "visible";
  cardDiv.innerHTML = null;
  cardDiv.classList = [];
  cardDiv.classList.add("plain-card");
  cardDiv.classList.add("smallDeal");
  const titleDiv = createTextDiv(title);
  const messageDiv = createTextDiv(message);
  const symbolDiv = createTextDiv(`Company Name : ${symbol}`);
  const rangeDiv = createTextDiv(historicTradingRange);
  const currentPriceDiv = createTextDiv(currentPrice);
  const bottomDiv = document.createElement("div");
  bottomDiv.classList.add("card-bottom");
  const buttons = document.createElement("div");
  buttons.className = "buttons_div";
  const button1 = createButton("Accept");
  const button2 = createButton("decline");
  appendChildren(buttons, [button1, button2]);
  appendChildren(bottomDiv, [symbolDiv, rangeDiv, currentPriceDiv]);
  appendChildren(cardDiv, [titleDiv, messageDiv, bottomDiv, buttons]);
};

const createRealEstateSmallDeal = function(card) {
  const { title, message, cost, mortgage, downPayment, cashFlow } = card;
  const cardDiv = document.getElementById("card");
  cardDiv.style.visibility = "visible";
  cardDiv.innerHTML = null;
  cardDiv.classList = [];
  cardDiv.classList.add("plain-card");
  cardDiv.classList.add("smallDeal");
  const titleDiv = createTextDiv(title);
  const messageDiv = createTextDiv(message);
  const mortgageDiv = createTextDiv(mortgage);
  const costDiv = createTextDiv(cost);
  const downPaymentDiv = createTextDiv(downPayment);
  const cashflowDiv = createTextDiv(cashFlow);
  const bottomDiv1 = document.createElement("div");
  const bottomDiv2 = document.createElement("div");
  bottomDiv1.classList.add("card-bottom");
  bottomDiv2.classList.add("card-bottom");
  const buttons = document.createElement("div");
  const button1 = createButton("Accept");
  const button2 = createButton("decline");
  buttons.className = "buttons_div";
  appendChildren(buttons, [button1, button2]);
  appendChildren(bottomDiv1, [costDiv, cashflowDiv]);
  appendChildren(bottomDiv2, [mortgageDiv, downPaymentDiv]);
  appendChildren(cardDiv, [
    titleDiv,
    messageDiv,
    bottomDiv1,
    bottomDiv2,
    buttons
  ]);
};

const createGoldSmallDeal = function(card) {
  const { title, message, numberOfCoins, cost } = card;
  const cardDiv = document.getElementById("card");
  cardDiv.style.visibility = "visible";
  cardDiv.innerHTML = null;
  cardDiv.classList = [];
  cardDiv.classList.add("plain-card");
  cardDiv.classList.add("smallDeal");
  const titleDiv = createTextDiv(title);
  const messageDiv = createTextDiv(message);
  const numberDiv = createTextDiv(numberOfCoins);
  const costDiv = createTextDiv(cost);
  const bottomDiv = document.createElement("div");
  bottomDiv.classList.add("card-bottom");
  const buttons = document.createElement("div");
  buttons.className = "buttons_div";
  const button1 = createButton("Accept");
  const button2 = createButton("decline");
  appendChildren(buttons, [button1, button2]);
  appendChildren(bottomDiv, [numberDiv, costDiv]);
  appendChildren(cardDiv, [titleDiv, messageDiv, bottomDiv, buttons]);
};

const showSmallDealCard = function(title, expenseAmount, type) {
  const cardDiv = document.getElementById("card");
  cardDiv.style.visibility = "visible";
  cardDiv.innerHTML = null;
  cardDiv.classList = [];
  cardDiv.classList.add("plain-card");
  cardDiv.classList.add(type);
  const titleDiv = createTextDiv(title);
  titleDiv.classList.add("card-title");
  const expenseDiv = createTextDiv("Pay $ " + expenseAmount);
  expenseDiv.classList.add("card-expense");
  cardDiv.appendChild(titleDiv);
  cardDiv.appendChild(expenseDiv);
};

const showPlainCard = function(title, expenseAmount, type) {
  const cardDiv = document.getElementById("card");
  cardDiv.style.visibility = "visible";
  cardDiv.innerHTML = null;
  cardDiv.classList = [];
  cardDiv.classList.add("plain-card");
  cardDiv.classList.add(type);
  const titleDiv = createTextDiv(title);
  titleDiv.classList.add("card-title");
  const expenseDiv = createTextDiv("Pay $ " + expenseAmount);
  expenseDiv.classList.add("card-expense");
  cardDiv.appendChild(titleDiv);
  cardDiv.appendChild(expenseDiv);
};

const showCard = function(card) {
  const cardHandlers = {
    doodad: showPlainCard.bind(
      null,
      card.data.title,
      card.data.expenseAmount,
      "doodad-card"
    ),
    market: showPlainCard.bind(
      null,
      card.data.title,
      card.data.cash,
      "market-card"
    )
  };
  cardHandlers[card.type] && cardHandlers[card.type]();
};

const handleCharity = function() {
  const askCharity = document.getElementById("askCharity");
  showCardOverLay();
  askCharity.style.visibility = "visible";
};

const showCardOverLay = function() {
  const cardOverlay = document.getElementById("card-overlay");
  cardOverlay.style.display = "block";
};

const hideCardOverLay = function() {
  const cardOverlay = document.getElementById("card-overlay");
  cardOverlay.style.display = "none";
};

const handleDeal = function() {
  const selectDeal = document.getElementById("select-deal");
  showCardOverLay();
  selectDeal.style.visibility = "visible";
};

const selectSmallDeal = function() {
  const cardTypes = {
    shares: createSharesSmallDeal,
    goldCoins: createGoldSmallDeal,
    realEstate: createRealEstateSmallDeal
  };

  closeOverlay("select-deal");
  hideCardOverLay();
  fetch("/selectSmallDeal")
    .then(data => data.json())
    .then(card => {
      cardTypes[card.relatedTo](card);
    });
};

const selectBigDeal = function() {
  closeOverlay("select-deal");
  hideCardOverLay();
  fetch("/selectBigDeal");
};

const rollDie = function() {
  const spacesHandlers = {
    charity: handleCharity,
    deal: handleDeal
  };

  const dice = document.getElementById("dice1");
  fetch("/rolldie")
    .then(res => res.json())
    .then(({ diceValue, spaceType }) => {
      dice.innerText = diceValue || dice.innerText;
      spacesHandlers[spaceType] && spacesHandlers[spaceType]();
      getElementById("notification").innerText = null;
    });
};

const polling = function(game) {
  let { players } = game;
  if (game.activeCard) {
    showCard(game.activeCard);
  }
  players.forEach(updateGamePiece);
};

const updateGamePiece = function(player) {
  let gamePiece = document.getElementById("gamePiece" + player.turn);
  gamePiece.classList.add("visible");
  let space = gamePiece.parentNode;
  let newSpace = document.getElementById(player.currentSpace);
  space.removeChild(gamePiece);
  newSpace.appendChild(gamePiece);
};

const showHover = function(parent) {
  const anchor = parent.children[0];
  anchor.style.visibility = "visible";
};

const hideHover = function(parent) {
  const anchor = parent.children[0];
  anchor.style.visibility = "hidden";
};

const createActivity = function({ playerName, msg, time }) {
  const activity = document.createElement("div");
  const activityPara = document.createElement("p");
  const timeHoverPara = document.createElement("p");
  timeHoverPara.classList.add("hover");
  timeHoverPara.innerText = new Date(time).toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });
  activity.onmouseover = showHover.bind(null, activity);
  activity.onmouseleave = hideHover.bind(null, activity);
  activity.classList.add("activity");
  activityPara.innerText = playerName + msg;
  activity.appendChild(timeHoverPara);
  activity.appendChild(activityPara);
  return activity;
};

const updateActivityLog = function(activityLog) {
  const activityLogDiv = document.getElementById("activityLog");
  const localActivitiesCount = activityLogDiv.children.length;
  if (activityLog.length == localActivitiesCount) {
    return;
  }
  const newActivities = activityLog.slice(localActivitiesCount);
  newActivities.forEach(activity => {
    let activityDiv = createActivity(activity);
    activityLogDiv.insertBefore(activityDiv, activityLogDiv.firstChild);
  });
};

const parseCookie = function() {
  const cookie = document.cookie;
  const keyValuePairs = cookie.split("; ");
  const parsedCookie = {};
  keyValuePairs.forEach(keyValue => {
    const [key, value] = keyValue.split("=");
    parsedCookie[key] = value;
  });
  return parsedCookie;
};

const getPlayerData = function(playersData) {
  const { playerName } = parseCookie();
  const playerData = playersData.filter(({ name }) => name == playerName)[0];
  return playerData;
};

const getGame = function() {
  fetch("/getgame")
    .then(data => data.json())
    .then(game => {
      updateActivityLog(game.activityLog);
      polling(game);
      const playerData = getPlayerData(game.players);
      updateStatementBoard(playerData);
    });
};

const initialize = function() {
  setInterval(getGame, 1000);
  setTimeout(getProfessions, 1500);
  let dice2 = document.getElementById("dice2");
  dice2.hidden = true;

  document.getElementById("loan-form-button").onclick = displayLoanForm;
  document.getElementById("pay-debt-form-button").onclick = displayPayDebtForm;
};

window.onload = () => {
  initialize();
  const acceptCharityButton = getElementById("acceptCharity");
  acceptCharityButton.onclick = acceptCharity;
  const declineCharityButton = getElementById("declineCharity");
  declineCharityButton.onclick = declineCharity;
};
