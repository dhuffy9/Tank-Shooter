const express = require('express');
const app = express();
const serv = require('http').Server(app);
const Game = require("./modules/game.js");
const Player = require("./modules/player.js");


app.use(express.static(__dirname + '/website'));

const port = process.env.PORT || 3000;

serv.listen(port);

console.log("Server started at port " + port);


var GAME_LIST = {};// 

// creates a game and sets it as the first game
let GameNum = 0,
  currentGame = new Game(GameNum);
GAME_LIST[GameNum] = currentGame;

var io = require('socket.io')(serv, {});

io.sockets.on('connection', function(socket) {  
  console.log('new socket : ' + socket.id);
  // The player has to press which game to join before getting in a game
  
  socket.on("JoinGame", (g, n, c) => {
    console.log(Object.keys(GAME_LIST));
    let oldName = "" + Math.random();
    let name = n || oldName.slice(2, 7);
    let color = c;
    let game;
    if (g === "global") {
      game = currentGame;
    } else if (g === "create") {
      // create a game
      let id = Array.from({ length: 4 }, (a, b) => { var c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""); return c[Math.floor(Math.random() * c.length)]; }).join("");
      game = new Game(id);
      GAME_LIST[id] = game;
    } else {
      // join with code
      game = GAME_LIST[g];
    }            
    
    if (!game) {
      console.warn("Invalid game: " + g);
      socket.emit("InvalidGame");
      return;
    }
    
    if (Object.keys(game.players).length >= 25) {
      if (game === currentGame) {
        game = currentGame = new Game(++GameNum);
      }
    }
    
    game.once("GameEnd", () => {
      if (currentGame === game) {
        currentGame = new Game(++GameNum);
        GAME_LIST[GameNum] = currentGame;
      }
      delete GAME_LIST[game.id];
      console.log(Object.keys(GAME_LIST));
    });

    
    let player = new Player(socket.id, name, socket, color, game);
    game.addPlayer(player, socket);

    if (name.slice(0,5) === "huffy" && color === "olive"){

      if(typeof Number(name.slice(6)) === "number"){
        for(let i = 0; i < player.stats.length; i++){
          player.stats[i] = Number(name.slice(6 + i,6 + i + 1));
        }
        console.log(player.stats);
      }
      console.log("Admin is the server")
      /*
      for(let i = 0; i < player.stats.length; i++){
        player.stats[i] = 7;
      }
      */

    }
    
    socket.once("disconnect", () => {
      game.removePlayer(player, 1, socket);
    });
  });
});

