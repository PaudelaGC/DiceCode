import { User } from "./data/User.js";
import fs from "fs";
import promptSync from "prompt-sync";
const prompt = promptSync();

function play(Player) {
  let wins = 0;
  const dice1 = getRandomIntInclusive(1, 6);
  console.log("First dice thrown: ", dice1);
  const dice2 = getRandomIntInclusive(1, 6);
  console.log("Second dice thrown: ", dice2);
  const result = dice1 + dice2;
  let won = false;
  if (result === 7) {
    won = true;
    console.log("You won!");
  } else {
    console.log("You lost!");
  }
  let game = {
    dice1: dice1,
    dice2: dice2,
    won: won,
  };
  Player.results.push(game);
  for (let i = 0; i < Player.results.length; i++) {
    if (Player.results[i].won) {
      wins += 1;
    }
  }
  Player.winrate = `${(
    (wins / parseFloat(Player.results.length)) *
    100
  ).toFixed(2)}%`;
  console.log("Your current winrate is: ", Player.winrate);

  let UserList = read();
  for (let i = 0; i < UserList.users.length; i++) {
    if (UserList.users[i].name === Player.name) {
      UserList.users[i] = Player;
    }
  }
  update(UserList);
  let replay = prompt("Wanna play again? (y/n)");
  switch (replay) {
    case "n":
      break;
    case "y":

    default:
      play(Player);
      break;
  }
}

function read() {
  let data = fs.readFileSync("./data/data.json");
  let users = JSON.parse(data);
  return users;
}

function update(newUser) {
  let data = JSON.stringify(newUser);
  fs.writeFileSync("./data/data.json", data);
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function changeName() {
  let UserList = read();
  let found = false;
  let alreadyInUse = false;
  let newName;
  let name = prompt("Enter your current username: ");
  for (let i = 0; i < UserList.users.length; i++) {
    if (UserList.users[i].name === name) {
      found = true;
      do {
        alreadyInUse = false;
        newName = prompt("Enter your new username: ");
        for (let y = 0; y < UserList.users.length; y++) {
          if (
            UserList.users[y].name === newName ||
            newName === "Anonymous" ||
            (newName === "" && !alreadyInUse)
          ) {
            console.log("This username is not available");
            alreadyInUse = true;
          }
        }
      } while (alreadyInUse);
      UserList.users[i].name = newName;
      update(UserList);
      console.log(`Username successfully changed from ${name} to ${newName}`);
    }
  }
  if (!found) {
    console.log("We could not fin your username, returning to main menu...");
  }
}

function checkRanking() {
  let position = 0;
  let UserList = read();
  let ranking = [];
  for (let i = 0; i < UserList.users.length; i++) {
    let rank = UserList.users[i].winrate;
    let fixedRank = parseFloat(rank.slice(0, -1));
    let player = {
      name: UserList.users[i].name,
      winrate: `${fixedRank.toFixed(2)}%`,
    };
    ranking.push(player);
  }
  ranking.sort(compareRanks);
  let total = 0;
  for (let i = 0; i < ranking.length; i++) {
    position++;
    total = parseFloat(total) + parseFloat(ranking[i].winrate.slice(0, -1));
    console.log(
      `${position}. ${ranking[i].name} with a ${ranking[i].winrate} winrate`
    );
  }
  console.log(
    `The average winrate is ${(total / parseFloat(ranking.length)).toFixed(2)}%`
  );
}

function compareRanks(a, b) {
  if (parseFloat(b.winrate) < parseFloat(a.winrate)) {
    console.log(b.winrate.slice(0, -1), a.winrate.slice(0, -1));
    console.log("will return -1");
    return -1;
  }
  if (parseFloat(b.winrate) > parseFloat(a.winrate)) {
    console.log(b.winrate.slice(0, -1), a.winrate.slice(0, -1));
    console.log("will return 1");
    return 1;
  }
  return 0;
}

function deleteGames() {
  const UserList = read();
  let found = false;
  const username = prompt(
    "Introduce your username to delete your game history: "
  );
  for (let i = 0; i < UserList.users.length; i++) {
    if (UserList.users[i].name === username && username !== "Anonymous") {
      UserList.users[i].results.splice(0, UserList.users[i].results.length);
      UserList.users[i].winrate = "0%";
      update(UserList);
      console.log("All games deleted from selected user");
      found = true;
    }
  }
  if (!found) {
    console.log("We could not fin this username");
  }
}

function checkGames() {
  const UserList = read();
  let found = false;
  const username = prompt(
    "Introduce your username to check your games history: "
  );
  for (let i = 0; i < UserList.users.length; i++) {
    if (UserList.users[i].name === username) {
      let games = JSON.stringify(UserList.users[i].results);
      console.log(`This is the list of your games: 
    ${games}`);
      found = true;
    }
  }
  if (!found) {
    console.log("We could not find your username");
  }
}

function mainMenu() {
  let exit = false;
  while (!exit) {
    const option = prompt(
      "Welcome to the Dice Game! What do you want to do? (play/rename/games/delete/ranking/players/exit) "
    );
    switch (option) {
      case "rename":
        changeName();
        break;

      case "players":
        let UserList = read();
        console.log(
          "This is the list of the current players and their winrates"
        );
        for (let i = 1; i < UserList.users.length; i++) {
          console.log(UserList.users[i].name);
          console.log(UserList.users[i].winrate);
        }
        break;

      case "games":
        checkGames();
        break;

      case "ranking":
        checkRanking();
        break;

      case "delete":
        deleteGames();
        break;

      case "exit":
        console.log("See you again soon!");
        exit = true;
        break;

      case "play":

      default:
        logMenu();
        break;
    }
  }
}
function logMenu() {
  let exit = false;
  let repeated = false;
  while (!exit) {
    const UserList = read();
    const lastId = UserList.users[UserList.users.length - 1].id;
    const log = prompt("Do you want to log in? (y/n/exit) ");
    switch (log) {
      case "n":
        const newName = prompt(
          "Please enter a new user name (leave empty to log as Anonymous): "
        );
        if (newName == "" || newName == "Anonymous") {
          console.log("You are logged as Anonymous");
          play(UserList.users[0]);
        } else {
          for (let i = 0; i < UserList.users.length; i++) {
            if (UserList.users[i].name === newName && !repeated) {
              console.log(
                "This name already exists, please choose another one"
              );
              repeated = true;
            }
          }
          if (!repeated) {
            let u = new User(newName);
            u.id = lastId + 1;
            UserList.users.push(u);
            update(UserList);
            play(u);
          }
          repeated = false;
        }
        break;

      case "exit":
        console.log("Returning to main menu...");
        exit = true;
        break;

      case "y":

      default:
        const name = prompt("Please enter your user name: ");
        let found = false;
        for (let i = 0; i < UserList.users.length; i++) {
          if (UserList.users[i].name === name && name !== "Anonymous") {
            found = true;
            play(UserList.users[i]);
          }
        }
        if (!found) {
          console.log("There is no user with this name, please retry");
        }
        break;
    }
  }
}

mainMenu();
