//@ts-check

const websocket = require("ws");

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
  this.images = null;
  this.turn = null;
  this.winner = null;
};

game.prototype.shuffleImages = function() {
  const images = ["1.jpg",
  "1.jpg",
  "2.jpg",
  "2.jpg",
  "3.jpg",
  "3.jpg",
  "4.jpg",
  "4.jpg",
  "5.jpg",
  "5.jpg",
  "6.jpg",
  "6.jpg",
  "7.jpg",
  "7.jpg",
  "8.jpg",
  "8.jpg",
  "9.jpg",
  "9.jpg",
  "10.jpg",
  "10.jpg",
  "11.jpg",  
  "11.jpg",
  "12.jpg",  
  "12.jpg",
  "13.jpg",  
  "13.jpg",
  "14.jpg",
  "14.jpg",
  "15.jpg",
  "15.jpg",]

    shuffle(images);
    this.images = images;   
}


game.prototype.getImages = function() {
  return this.images;
}

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
