const renderHomePage = function(req, res) {
  res.redirect("/homepage.html");
};

const getCurrentGame = function(req, res, next) {
  const { gameId } = req.cookies;
  req.game = res.app.games[gameId];
  next();
};

const logRequest = function(req, res, next) {
  console.log("URL --> ", req.url);
  console.log("Method  --> ", req.method);
  next();
};

module.exports = {
  renderHomePage,
  logRequest,
  getCurrentGame
};
