const express = require("express");
const http = require("http");
const websocket  = require("ws");

var indexRouter = require('./routes/index');
const messages = require("./public/javascripts/messages");

const gameStatus = require("./statTracker");
const Game = require("./game");

const port = process.argv[2];
const app = express();

app.use(express.static(__dirname + "/public"));
app.use('/', indexRouter);



const server = http.createServer(app);

const wss = new websocket.Server({ server });


const websockets = {}; //property: websocket, value: game
let currentGame = new Game(gameStatus.gamesInitialized++);
let connectionID = 0; //each websocket receives a unique ID


wss.on("connection", function (ws) {
  const con = ws;
  con["id"] = connectionID++;
  const playerNumber = currentGame.addPlayer(con);

  gameStatus.onlinePlayers++;
  websockets[con["id"]] = currentGame;

  console.log(
    `Player ${con["id"]} placed in game ${currentGame.id} as ${playerNumber}`
  );

  if (currentGame.hasTwoConnectedPlayers()) {
    currentGame.shuffleImages();
    const mess = {
      type: "setImages",
      images: currentGame.getImages()
    }
    currentGame.player1.send(JSON.stringify(mess));
    currentGame.player2.send(JSON.stringify(mess));
    
    currentGame = new Game(gameStatus.gamesInitialized++);
  }

  con.on("message", function incoming(message) {
    const oMsg = JSON.parse(message.toString());

    const gameObj = websockets[con["id"]];
    const isPlayerA = gameObj.playerA == con ? true : false;

    if (isPlayerA) {
      /*
       * player A cannot do a lot, just send the target word;
       * if player B is already available, send message to B
       */
      if (oMsg.type == messages.T_TARGET_WORD) {
        gameObj.setWord(oMsg.data);

        if (gameObj.hasTwoConnectedPlayers()) {
          gameObj.playerB.send(message);
        }
      }
    } else {
      /*
       * player B can make a guess;
       * this guess is forwarded to A
       */
      if (oMsg.type == messages.T_MAKE_A_GUESS) {
        gameObj.playerA.send(message);
        gameObj.setStatus("CHAR GUESSED");
      }

      /*
       * player B can state who won/lost
       */
      if (oMsg.type == messages.T_GAME_WON_BY) {
        gameObj.setStatus(oMsg.data);
        //game was won by somebody, update statistics
        gameStatus.gamesCompleted++;
      }
    }
  });

  con.on("close", function(code) {
    /*
     * code 1001 means almost always closing initiated by the client;
     * source: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
     */
    gameStatus.onlinePlayers--;
    console.log(`${con["id"]} disconnected ...`);

    if (code == 1001) {
      /*
       * if possible, abort the game; if not, the game is already completed
       */
      const gameObj = websockets[con["id"]];

      if (gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
        gameObj.setStatus("ABORTED");
        gameStatus.gamesAborted++;

        /*
         * determine whose connection remains open;
         * close it
         */
        try {
          gameObj.playerA.close();
          gameObj.playerA = null;
        } catch (e) {
          console.log("Player A closing: " + e);
        }

        try {
          gameObj.playerB.close();
          gameObj.playerB = null;
        } catch (e) {
          console.log("Player B closing: " + e);
        }
      }
    }
  });

});

server.listen(port);


/*var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;*/
