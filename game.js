//@ts-check

const websocket = require("ws");
const { report } = require("./routes");

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

/**
 * Game constructor. Every game has two players, identified by their WebSocket.
 * @param {number} gameID every game has a unique game identifier.
 */
const game = function(gameID) {
  this.player1 = null;
  this.player2 = null;
  this.id = gameID;
  this.gameState = "0 JOINT"; //"A" means A won, "B" means B won, "ABORTED" means the game was aborted
  this.images = null;
  this.turn = null;
};

game.prototype.shuffleImages = function() {
  const images = ["library.jpg",
  "library.jpg",
  "eemc.jpg",
  "eemc.jpg",
  "architecture.jpg",
  "architecture.jpg",
  "library2.jpg",
  "library2.jpg",
  "civileng.jpg",
  "civileng.jpg",
  "aula.png",
  "aula.png",
  "aero.jfif",
  "aero.jfif",
  "aero2.jfif",
  "aero2.jfif",
  "mechanical.jpg",
  "mechanical.jpg",
  "pulse.jfif",
  "pulse.jfif",
  "pulse2.jpg",  
  "pulse2.jpg",
  "pulse3.jpg",  
  "pulse3.jpg",
  "pulse4.jpg",  
  "pulse4.jpg",
  "aula2.jpg",
  "aula2.jpg",
  "x.jfif",
  "x.jfif",
]

    shuffle(images);
    this.images = images;   
}


game.prototype.getImages = function() {
  return this.images;
}


/**
 * Update the word to guess in this game.
 * @param {string} w word to guess
 * @returns 
 */
game.prototype.setWord = function(w) {
  //two possible options for the current game state:
  //1 JOINT, 2 JOINT
  if (this.gameState != "1 JOINT" && this.gameState != "2 JOINT") {
    return new Error(
      `Trying to set word, but game status is ${this.gameState}`
    );
  }
  this.wordToGuess = w;
};

/**
 * Retrieves the word to guess.
 * @returns {string} the word to guess
 */
game.prototype.getWord = function() {
  return this.wordToGuess;
};

/**
 * Checks whether the game is full.
 * @returns {boolean} returns true if the game is full (2 players), false otherwise
 */
game.prototype.hasTwoConnectedPlayers = function() {
  //return this.gameState == "2 JOINT";
  return this.player1!=null && this.player2!=null;
};

/**
 * Adds a player to the game. Returns an error if a player cannot be added to the current game.
 * @param {websocket} p WebSocket object of the player
 * @returns {(string|Error)} returns "A" or "B" depending on the player added; returns an error if that isn't possible
 */
game.prototype.addPlayer = function(p) {
  if(this.player1 == null) {
    this.player1 = p;
    return "Player1";
  }    
  else if(this.player2 == null) {
    this.player2 = p;
    return "Player2";
  }
  else
    return new Error(
      `Already 2 players`
    );
};

module.exports = game;
