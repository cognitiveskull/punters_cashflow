const { rollDie, startGame } = require("../src/handlers");
const chai = require("chai");
const sinon = require("sinon");

describe("rollDie", function() {
  let req, res;

  beforeEach(() => {
    req = {};
    req.game = {
      updateActivity: sinon.spy(),
      nextPlayer: sinon.spy(),
      currentPlayer: {
        deactivateDice: function() {
          this.haveToActivateDice = false;
        },
        haveToActivateDice: true,
        didUpdateSpace: false,
        move: sinon.spy()
      }
    };
    res = {};
    res.send = sinon.spy();
  });

  it("should return 200 status", function() {
    rollDie(req, res);
    const statusCode = +res.send.firstCall.lastArg;
    chai.expect(statusCode).equals(200);
  });

  it("should return a number between 1 and 6 ", function() {
    rollDie(req, res);
    const returnValue = +res.send.firstCall.args[0];
    chai.expect(returnValue).to.be.at.least(1);
    chai.expect(returnValue).to.be.at.most(6);
  });

  it("should  call update activity", function() {
    let { updateActivity } = req.game;
    rollDie(req, res);
    const isUpdateActivityCalled = updateActivity.calledOnce;
    chai.expect(isUpdateActivityCalled).to.be.true;
  });

  it("should  call update activity with msg rolled some number", function() {
    let { updateActivity } = req.game;
    rollDie(req, res);
    const activityMsg = updateActivity.firstCall.lastArg;
    chai.expect(activityMsg).to.match(/rolled [1-6]/);
  });

  it("should has to change haveToActivateDice  of current playe to false", function() {
    let { currentPlayer } = req.game;
    rollDie(req, res);
    chai.expect(currentPlayer.haveToActivateDice).to.be.false;
  });
});

describe("startGame", function() {
  it("should redirect to board.html", function() {
    let req = {
      game: {
        getInitialDetails: () => {}
      }
    };
    let res = {
      redirect: location => {
        chai.expect(location).to.eql("/board.html");
      }
    };
    startGame(req, res);
  });
});
