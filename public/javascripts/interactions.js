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
 * Set the word to guess.
 * @param {string} w word to set
 */
// GameState.prototype.setTargetWord = function (w) {
//   this.targetWord = w;
// };

/**
 * Retrieve the word array.
 * @returns {string[]} array of letters
 */
// GameState.prototype.getVisibleWordArray = function () {
//   return this.visibleWordArray;
// };

/**
 * Increase the wrong-guess count.
 */
// GameState.prototype.incrWrongGuess = function () {
//   this.wrongGuesses++;

//   if (this.whoWon() == null) {
//     //hide a balloon
//     const id = "b" + this.wrongGuesses;
//     document.getElementById(id).className += " balloonGone";
//   }
// };
GameState.prototype.incrP1Score = function () {
  this.p1Score++;
};

GameState.prototype.incrP2Score = function () {
  this.p2Score++;
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

/**
 * Update the game state given the letter that was just clicked.
 * @param {string} clickedLetter
 */
GameState.prototype.updateGame = function (clickedLetter) {
  
};

/**
 * Initialize the alphabet board.
 * @param {*} gs
 */
function AlphabetBoard(gs) {
  //only initialize for player that should actually be able to use the board
  this.initialize = function () {
    const elements = document.querySelectorAll(".letter");
    Array.from(elements).forEach(function (el) {
      el.addEventListener("click", function singleClick(e) {
        const clickedLetter = e.target["id"];
        

        gs.updateGame(clickedLetter);

        /*
         * every letter can only be clicked once;
         * here we remove the event listener when a click happened
         */
        el.removeEventListener("click", singleClick, false);
      });
    });
  };
}

/**
 * Disable the alphabet buttons.
 */
function disableAlphabetButtons() {
  const alphabet = document.getElementById("alphabet");
  const letterDivs = alphabet.getElementsByTagName("div");
  for (let i = 0; i < letterDivs.length; i++) {
    letterDivs.item(i).className += " alphabetDisabled";
  }
}

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
  const ab = new AlphabetBoard(gs);

  socket.onmessage = function (event) {
    let incomingMsg = JSON.parse(event.data);
    sb.setStatus(JSON.stringify(incomingMsg));

    if(incomingMsg.type == "setImages") {  
      gs.alphabet.setImages(incomingMsg.images);
    }

    //set player type
    if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
      gs.setPlayerType(incomingMsg.data); //should be "A" or "B"

      //if player type is A, (1) pick a word, and (2) sent it to the server
      if (gs.getPlayerType() == "A") {
        disableAlphabetButtons();

        sb.setStatus(Status["player1Intro"]);
        let validWord = -1;
        let promptString = Status["prompt"];
        let res = null;

        while (validWord < 0) {
          res = prompt(promptString);

          if (res == null) {
            promptString = Status["prompt"];
          } else {
            res = res.toUpperCase(); //game is played with uppercase letters

            if (
              res.length < Setup.MIN_WORD_LENGTH ||
              res.length > Setup.MAX_WORD_LENGTH
            ) {
              promptString = Status["promptAgainLength"];
            } else if (/^[a-zA-Z]+$/.test(res) == false) {
              promptString = Status["promptChars"];
            }
            //dictionary has only lowercase entries
            //TODO: convert the dictionary to uppercase to avoid this extra string conversion cost
            else if (
              Object.prototype.hasOwnProperty.call(
                // @ts-ignore
                englishDict,
                res.toLocaleLowerCase()
              ) == false
            ) {
              promptString = Status["promptEnglish"];
            } else {
              validWord = 1;
            }
          }
        }
        sb.setStatus(Status["chosen"] + res);
        gs.setTargetWord(res);
        gs.initializeVisibleWordArray(); // initialize the word array, now that we have the word
        vw.setWord(gs.getVisibleWordArray());

        let outgoingMsg = Messages.O_TARGET_WORD;
        outgoingMsg.data = res;
        socket.send(JSON.stringify(outgoingMsg));
      } else {
        sb.setStatus(Status["player2IntroNoTargetYet"]);
      }
    }

    //Player B: wait for target word and then start guessing ...
    if (
      incomingMsg.type == Messages.T_TARGET_WORD &&
      gs.getPlayerType() == "B"
    ) {
      gs.setTargetWord(incomingMsg.data);

      sb.setStatus(Status["player2Intro"]);
      gs.initializeVisibleWordArray(); // initialize the word array, now that we have the word
      ab.initialize();
      vw.setWord(gs.getVisibleWordArray());
    }

    //Player A: wait for guesses and update the board ...
    if (
      incomingMsg.type == Messages.T_MAKE_A_GUESS &&
      gs.getPlayerType() == "A"
    ) {
      sb.setStatus(Status["guessed"] + incomingMsg.data);
      gs.updateGame(incomingMsg.data);
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
