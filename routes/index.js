var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile('/splash.html', { root: "./public" });
});

router.get("/play", function(req, res) {
  res.sendFile("/game.html", { root: "./public" });
});

module.exports = router;



//const gameStatus = require("../statTracker");

/* GET home page 
router.get("/splash", function(req, res) {
  res.sendFile("splash.html", { root: "./public" });
});
*/

/* Pressing the 'PLAY' button, returns this page */


/* GET home page */
// router.get("/", function(req, res) {
//   res.render("splash.ejs", {
//     gamesInitialized: gameStatus.gamesInitialized,
//     gamesCompleted: gameStatus.gamesCompleted
//   });
// });
