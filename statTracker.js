//@ts-check

/**
 * In-game stat tracker. 
 * Once the game is out of prototype status, this object will be backed by a database.
 */
 const gameStatus = {
    gamesInitialized: 0 /* number of games initialized */,
    gamesAborted: 0 /* number of games aborted */,
    gamesCompleted: 0 /* number of games successfully completed */,
    onlinePlayers: 0
  };
  
  module.exports = gameStatus;
  