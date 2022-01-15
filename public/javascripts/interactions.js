/* eslint-disable no-undef */
//@ts-check



/**
 * Game state object
 * @param {*} visibleWordBoard
 * @param {*} sb
 * @param {*} socket
 */
function GameState(visibleWordBoard, sb, socket) {
  this.playerType = null;
  //this.visibleWordArray = null;
  this.alphabet = new Alphabet();
  this.alphabet.initialize();
  this.visibleWordBoard = visibleWordBoard;
  //this.targetWord = null;
  this.statusBar = sb;
  this.socket = socket;
  this.p1Score = 0;
  this.p2Score = 0;
  this.prevGuess = null;
  this.prevDivID = null;
}

/**
 * Initializes the word array.
 */
// GameState.prototype.initializeVisibleWordArray = function () {
//   this.visibleWordArray = new Array(this.targetWord.length);
//   this.visibleWordArray.fill(Setup.HIDDEN_CHAR);
// };

/**
 * Retrieve the player type.
 * @returns {string} player type
 */
GameState.prototype.getPlayerType = function () {
  return this.playerType;
};

/**
 * Set the player type.
 * @param {string} p player type to set
 */
GameState.prototype.setPlayerType = function (p) {
  this.playerType = p;
};

/**
 * Retrieve the word array.
 * @returns {string[]} array of letters
 */
// GameState.prototype.getVisibleWordArray = function () {
//   return this.visibleWordArray;
// };

GameState.prototype.incrP1Score = function () {
  this.setScore(this.playerType, this.p1Score+1)

  this.socket.send(JSON.stringify({type: "updateScore", data: this.p1Score+""}));
};

GameState.prototype.incrP2Score = function () {
  this.setScore(this.playerType, this.p2Score+1)

  this.socket.send(JSON.stringify({type: "updateScore", data: this.p2Score+""}));
};

GameState.prototype.setScore = function (playerType, score) {
  if(playerType == "Player1") {
    this.p1Score = score;
    let div = document.getElementById("p1Score");
    div.innerHTML=this.p1Score+"";
  }
  else {
    this.p2Score = score;
    let div = document.getElementById("p2Score");
    div.innerHTML=this.p2Score+"";
  }

 
};



/**
 * Check if anyone one won.
 * @returns {string|null} player who whon or null if there is no winner yet
 */
// GameState.prototype.whoWon = function () {
//   //too many wrong guesses? Player A (who set the word) won
//   if (this.wrongGuesses > Setup.MAX_ALLOWED_GUESSES) {
//     return "A";
//   }
//   //word solved? Player B won
//   if (this.visibleWordArray.indexOf(Setup.HIDDEN_CHAR) < 0) {
//     return "B";
//   }
//   return null; //nobody won yet
// };
GameState.prototype.whoWon = function () {
 
  if (this.p1Score + this.p2Score == 15) {
    if(this.p1Score > this.p2Score)
      return "Player1";
    else
      return "Player2";
  }

  return null; //nobody won yet
};
/**
 * Retrieve the positions of the given letter in the target word.
 * @param {string} letter
 * @param {number[]} indices
 */
// GameState.prototype.revealLetters = function (letter, indices) {
//   for (let i = 0; i < indices.length; i++) {
//     this.visibleWordArray[indices[i]] = letter;
//   }
// };

/**
 * Reveal all letters.
 */
// GameState.prototype.revealAll = function () {
//   this.visibleWordBoard.setWord(this.targetWord);
// };


GameState.prototype.updateGame = function (divID, gs) {
  //this.statusBar.setStatus(divID);

  //this.makeImageUnAvailable(divID, gs);
};

GameState.prototype.makeChange = function(divID, gs) {
  this.makeImageUnAvailable(divID, gs);
  gs.sendMessageToServer(divID, "unav");

  let image = document.getElementById(divID).childNodes[0].src;
  if(this.prevGuess == null) {
    this.prevGuess = image;
    this.prevDivID = divID;
  }
  else if(image == this.prevGuess) {
    this.statusBar.setStatus("yeiiii");
    if(this.playerType == "Player1")
      this.incrP1Score();
    else
      this.incrP2Score();
    gs.changeTurn(gs);
  }
  else {
    this.statusBar.setStatus("reset");
      setTimeout(() => {
      gs.makeImageAvailable(divID, gs);
      gs.sendMessageToServer(divID, "av");
      gs.makeImageAvailable(gs.prevDivID, gs);
      gs.sendMessageToServer(gs.prevDivID, "av");
      gs.changeTurn(gs);
      }, 1000);
    
    }
}

GameState.prototype.changeTurn = (gs) => {
  gs.prevGuess = null;
  gs.prevDivID = null;
}

GameState.prototype.showImage = (divID) => {
  let image = document.getElementById(divID).childNodes[0];
  image.style.visibility = "visible";
};

GameState.prototype.hideImage = (divID) => {
  let image = document.getElementById(divID).childNodes[0];
  image.style.visibility = "hidden";
};

GameState.prototype.makeImageUnAvailable = (divID, gs) => {
  gs.showImage(divID);
  let div = document.getElementById(divID);
  div.style.pointerEvents = "none";
};

GameState.prototype.makeImageAvailable = (divID, gs) => {
  gs.hideImage(divID);
  let div = document.getElementById(divID);
  div.style.pointerEvents = "auto";
  eventFunc(div, gs);
};

GameState.prototype.sendMessageToServer = function(divID, state) {
  let mess = {
    type: "Guess",
    state: state,
    data: divID
  }
  this.socket.send(JSON.stringify(mess));
}

GameState.prototype.initializeBoard = function (gs) {
  const elements = document.querySelectorAll(".letter");
  Array.from(elements).forEach((el) => eventFunc(el, gs));
};

const eventFunc = (el, gs) => {
  el.addEventListener("click", function singleClick(e) {
    const clickedLetter = e.target["id"];

    gs.makeChange(clickedLetter, gs);

    el.removeEventListener("click", singleClick, false);
  });
};



//set everything up, including the WebSocket
(function setup() {
  const socket = new WebSocket(Setup.WEB_SOCKET_URL);

  /*
   * initialize all UI elements of the game:
   * - visible word board (i.e. place where the hidden/unhidden word is shown)
   * - status bar
   * - alphabet board
   *
   * the GameState object coordinates everything
   */

  // @ts-ignore
  // @ts-ignore
  const sb = new StatusBar();

  //no object, just a function
  // @ts-ignore

  const gs = new GameState(null, sb, socket);
  gs.initializeBoard(gs);
 // ab.initialize();
  socket.onmessage = function (event) {
    let incomingMsg = JSON.parse(event.data);

    if(incomingMsg.type == "setImages") {  
      gs.alphabet.setImages(incomingMsg.images);
    }

    if(incomingMsg.type == "setPlayerType") {
      gs.setPlayerType(incomingMsg.data);
    }

    if(incomingMsg.type == "Guess") {
      if(incomingMsg.state == "unav")
        gs.makeImageUnAvailable(incomingMsg.data, gs);
      else
        gs.makeImageAvailable(incomingMsg.data, gs);
      //gs.updateGame(incomingMsg.data);
    }

    if(incomingMsg.type == "updateScore") {
      if(gs.playerType == "Player1")
        gs.setScore("Player2", incomingMsg.data);
      else
        gs.setScore("Player1", incomingMsg.data);
    }

    if(incomingMsg.type == "setGameID") {
      document.getElementById("gameID").innerHTML = incomingMsg.data;
    }
    

  };

  socket.onopen = function () {
    socket.send("{}");
  };

  //server sends a close event only if the game was aborted from some side
  socket.onclose = function () {
    if (gs.whoWon() == null) {
      sb.setStatus(Status["aborted"]);
    }
  };

  socket.onerror = function () {};
})(); //execute immediately
