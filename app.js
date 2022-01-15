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
    const oMsg = JSON.parse(message);

    const gameObj = websockets[con["id"]];
    const isPlayer1 = gameObj.player1 == con ? true : false;

    console.log(oMsg);

    if(oMsg.type === "Guess") {
        if(isPlayer1) {
          gameObj.player2.send(JSON.stringify(oMsg));
          console.log("Sent")
        }
        else
          gameObj.player1.send(JSON.stringify(oMsg));
    }

    if (isPlayer1) {
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

      if (gameObj.player1 != null  || gameObj.player2 != null) {
        gameStatus.gamesAborted++;

        /*
         * determine whose connection remains open;
         * close it
         */
        try {
          gameObj.player1.close();
          gameObj.player1 = null;
        } catch (e) {
          console.log("Player 1 closing: " + e);
        }

        try {
          gameObj.player2.close();
          gameObj.player2 = null;
        } catch (e) {
          console.log("Player 2 closing: " + e);
        }
      }
    }
  });

});

server.listen(port);
