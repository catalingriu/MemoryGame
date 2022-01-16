//@ts-check

function GameState(sb, socket) {
  this.playerType = null;
  this.statusBar = sb;
  this.socket = socket;
  this.p1Score = 0;
  this.p2Score = 0;
  this.prevGuess = null;
  this.prevDivID = null;
  this.myTurn = false;
}

GameState.prototype.setImages = function(images) {
  for(let i=1; i <= 30; i++) {
    let image = document.createElement("img");
    image.src = "images/" + images[i-1];

    let div = document.getElementById(""+i);
    div.appendChild(image);
   }
};

GameState.prototype.getPlayerType = function () {
  return this.playerType;
};

GameState.prototype.setPlayerType = function (p) {
  this.playerType = p;
};

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

  //this.statusBar.append(parseInt(""+this.p1Score) + parseInt(""+this.p2Score));

  if(parseInt(""+this.p1Score) + parseInt(""+this.p2Score) == 15) {  //sting to int
    let winner = ((this.p1Score > this.p2Score)?"Player1" : "Player2");
    this.statusBar.append("Game Over! " + winner + " won!");

    //only the winner alerts the server
    if(winner === playerType) 
      this.socket.send(JSON.stringify({type: "gameCompleted", data: playerType}));
  }
  
  
  

};

GameState.prototype.whoWon = function () {
 
  if (this.p1Score + this.p2Score == 15) {
    if(this.p1Score > this.p2Score)
      return "Player1";
    else
      return "Player2";
  }

  return null; //nobody won yet
};



GameState.prototype.makeChange = function(divID, gs) {
  gs.makeImageUnAvailable(divID, gs);
  gs.sendMessageToServer(divID, "unav");

  //gs.statusBar.append(gs.playerType + " chose " + divID);

  let image = document.getElementById(divID).childNodes[0].src;
  if(gs.prevGuess === null) {
    gs.prevGuess = image;
    gs.prevDivID = divID;
  }
  else if(image === gs.prevGuess) {
    gs.statusBar.append("You got one point!");
    if(gs.playerType == "Player1")
      gs.incrP1Score();
    else 
      gs.incrP2Score();
   
    gs.changeTurn(gs);
  }
  else {
      gs.disableChanges();
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
  gs.myTurn = false;

  gs.disableChanges();
  let other = "Player1"
  if(gs.playerType === "Player1")
    other = "Player2";
  gs.socket.send(JSON.stringify({type: "changeTurn", for: other, data: ""}));
  
  document.getElementById(gs.playerType + "Turn").style.visibility = "hidden";
  if(gs.playerType === "Player1")
      document.getElementById("Player2Turn").style.visibility = "visible";
  else
      document.getElementById("Player1Turn").style.visibility = "visible";
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
  document.getElementById(divID).style.pointerEvents = "none";
};

GameState.prototype.makeImageAvailable = (divID, gs) => {
  gs.hideImage(divID);
  document.getElementById(divID).style.pointerEvents = "auto";
 // eventFunc(div, gs);
};

GameState.prototype.sendMessageToServer = function(divID, state) {
  let mess = {
    type: "Guess",
    state: state,
    data: divID
  }
  this.socket.send(JSON.stringify(mess));
}

GameState.prototype.enableChanges = () => {
  const elements = document.querySelectorAll(".letter");
  Array.from(elements).forEach((el) => {
    
    //if(getComputedStyle(el.childNodes[0], visibility) === 'hidden')
      el.style.pointerEvents = "auto";
  });
}

GameState.prototype.disableChanges = () => {
  const elements = document.querySelectorAll(".letter");
  Array.from(elements).forEach((el) => el.style.pointerEvents = "none");
}

GameState.prototype.initializeBoard = function (gs) {
  const elements = document.querySelectorAll(".letter");
  Array.from(elements).forEach((el) => eventFunc(el, gs));
};

const eventFunc = (el, gs) => {
  el.addEventListener("click", function singleClick(e) {
    const clickedLetter = e.target["id"];

    gs.makeChange(clickedLetter, gs);

   // el.removeEventListener("click", singleClick, false);
  });
};



//set everything up, including the WebSocket
(function setup() {
  const socket = new WebSocket("ws://localhost:3000");

  const sb = new StatusBar();


  const gs = new GameState(sb, socket);
  gs.initializeBoard(gs);
  gs.disableChanges();
  document.getElementById("Player1Turn").style.visibility = "hidden";
  document.getElementById("Player2Turn").style.visibility = "hidden";
  

  socket.onmessage = function (event) {
    let incomingMsg = JSON.parse(event.data);

    if(incomingMsg.type == "setImages") {  
      gs.setImages(incomingMsg.images);
      gs.statusBar.append("Game started!");
      if(gs.playerType === "Player1") 
        gs.enableChanges();
      document.getElementById("Player1Turn").style.visibility = "visible";
    }

    if(incomingMsg.type == "setPlayerType") {
      gs.setPlayerType(incomingMsg.data);

      if(gs.playerType == "Player1") {
        gs.statusBar.append("Waiting for Player2!");
        document.getElementById("player1div").innerHTML = "  (You)";
      }
      else
        document.getElementById("player2div").innerHTML = "  (You)";
      
    }

    if(incomingMsg.type == "Guess") {
      if(incomingMsg.state === "unav")
        gs.makeImageUnAvailable(incomingMsg.data, gs);
      else 
        gs.makeImageAvailable(incomingMsg.data, gs);
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

    if(incomingMsg.type == "changeTurn") {
      if(!gs.myTurn) {
        gs.myTurn = true;
        gs.enableChanges();

        //set # (turn)
        document.getElementById(gs.playerType+"Turn").style.visibility = "visible";
        if(gs.playerType === "Player1")
          document.getElementById("Player2Turn").style.visibility = "hidden";
        else
          document.getElementById("Player1Turn").style.visibility = "hidden";
      }
    }
    

  };

  //server sends a close event only if the game was aborted from some side
  socket.onclose = function () {
    if (gs.whoWon() == null) {
      sb.append("Your gaming partner is no longer available, game aborted.");
      gs.disableChanges();
    }
  };

})(); //execute immediately
