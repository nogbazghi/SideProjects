var PIDs = [];
var playerContent = new Map();
var players = [];

//checks the internet connection status, determines whether to add, delete, or pull from local storage
var onlineStatus = window.navigator.onLine;
if (onlineStatus){
  //handles local storage
  console.log("online");
  localforage.clear().then(function() {
      // Run this code once the database has been entirely deleted.
      console.log('local storage is now empty. It will be refilled when you select players.');
  }).catch(function(err) {
      // This code runs if there were any errors
      console.log(err);
  });
} else {
  console.log("offline");
  localforage.getItem('players').then(function(value) {
      // This code runs once the value has been loaded
      // from the offline store.
      playerContent = value;
      PIDs = playerContent.keys();
      console.log(value);
  }).catch(function(err) {
      // This code runs if there were any errors
      console.log(err);
  });
}

localforage.config({
  name: 'NBA Player Tracker PDA App'
});

localforage.ready().then(function() {
    // This code runs once localforage
    // has fully initialized the selected driver.
    console.log(localforage.driver()); // LocalStorage
}).catch(function (e) {
    console.log(e); // `No available storage method found.`
    // One of the cases that `ready()` rejects,
    // is when no usable storage driver is found
});

//URLs for accessing NBA API
var url = 'http://data.nba.net/10s/prod/v1/';
var currYear = '2017/';
var today = 'today.json';
var roster = 'players.json';
var playerURL = 'players/';
var playerProfile = '_profile.json';
var playerGameLog = '_gamelog.json';
var team = 'teams.json';
var teamSchedule = '/schedule.json';
var boxscore = '_boxscore.json';

//function to make Hitting the API easier
function requestData(req, url) {
  req.open('GET', url, true);
  req.responseType = 'json';
  req.send();
}

//get today's info
var reqToday = new XMLHttpRequest();
requestData(reqToday, url+today);
var currentDate = "";
reqToday.onload = function(){
  var data = reqToday.response;
  var iterater = [];
  iterater.push(data)
  console.log(iterater[0]);
  currentDate = iterater[0]['currentDate'];
}

var names =[];
var teams = new Map();
var autoComp = [];
var playerID = 0;
var selectedPName = "";
var seasonsAvgs = [];
var careerAvg = {"ppg":0, "rpg":0, "apg":0, "spg":0, "bpg":0};

//get Player Names in League and put it in a dropdown
var request = new XMLHttpRequest();
var leagueRoster = url+currYear+roster;
requestData(request, leagueRoster);
request.onload = function() {
  var data = request.response;
  var iterater = [];
  iterater.push(data['league']['standard']);
  //generate dropdown player name list
  for(i =0; i <iterater[0].length; i++){
    names.push(iterater[0][i]);
    autoComp.push(iterater[0][i]['firstName'] + " " + iterater[0][i]['lastName']);
    //put player name and ID on list
    var li = document.createElement("li");
    li.setAttribute("class", "mdl-menu__item");
    li.setAttribute("data-val", iterater[0][i]['personId']);
    li.setAttribute("onclick", "getID(this);");
    li.onclick = function(obj){
      getID(obj);
    }
    li.innerHTML = iterater[0][i]['firstName'] + " " + iterater[0][i]['lastName'];

    document.getElementsByClassName('mdl-menu mdl-menu--bottom-left mdl-js-menu')[0].appendChild(li);
  }
}

//list of teams
var teamReq = new XMLHttpRequest();
var teamList = url+currYear+team
requestData(teamReq, teamList);
teamReq.onload = function(){
  var data = teamReq.response;
  var iterater = [];
  iterater.push(data['league']['standard']);
  for (var i = 0; i < iterater[0].length; i++) {
    teams.set(iterater[0][i]['teamId'], [iterater[0][i]['fullName'], iterater[0][i]['urlName']]);
  }
}

//creates card that displays player content
function createCard(playerID, playerName){
  //cardHeader
  var cardPName = document.createElement("h2");
  cardPName.setAttribute("class", "mdl-card__title-text");
  cardPName.setAttribute("id", playerID);
  cardPName.innerHTML = playerName;

  var card = document.createElement("div");
  card.setAttribute("class", "demo-card-square mdl-card mdl-shadow--2dp");
  var cardTitle = document.createElement("div");
  cardTitle.setAttribute("class", "mdl-card__title mdl-card--expand");
  cardTitle.appendChild(cardPName);
  card.appendChild(cardTitle);


  var cardUpdate = document.createElement("div");
  cardUpdate.setAttribute("class", "mdl-card__actions mdl-card--border");
  var cardEnlarger = document.createElement("a");
  cardEnlarger.setAttribute("class", "mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect");
  cardUpdate.setAttribute("onclick", "expand(this.parentElement);");
  cardEnlarger.innerHTML = "View More Info";
  cardUpdate.appendChild(cardEnlarger);

  card.appendChild(cardUpdate);
  return card;
}

var playerData;
//generates card
function getID(obj){
  playerData = {'name': '','carAvg':Object, 'seasAvg':[]};
  playerID = obj.path[0].dataset.val;
  var exists = false;
  for(i = 0; i < PIDs.length; i++){
    if(PIDs[i] == playerID){
      exists = true;
      break;
    }
  }
  if (exists == true){
    alert("This player has already been displayed");
  } else {
    var playerName = obj.path[0].innerHTML;
    playerData.name = playerName;
    //playerCard
    var card = createCard(playerID, playerName);

    //Content
    var cardText = document.createElement("div");
    cardText.setAttribute("class", "mdl-card__supporting-text");

    var playerProfileURL = url+currYear+playerURL+playerID+playerProfile;
    var req = new XMLHttpRequest();
    requestData(req, playerProfileURL);
    req.onload = function() {
      var playerProfileData = req.response;
      iterater = [];
      iterater.push(playerProfileData['league']['standard']['stats']);
      var careerdata = iterater[0]['careerSummary'];
      careerAvg ={"ppg": careerdata['ppg'], "rpg":careerdata['rpg'], "apg":careerdata['apg'], "spg":careerdata['spg'], "bpg":careerdata['bpg']};
      playerData.carAvg = careerAvg;
      var statType = ["ppg", "rpg", "apg", "spg", "bpg"];
      for (var i = 0; i < Object.keys(careerAvg).length; i++) {
        var stat = document.createElement("p");
        stat.setAttribute("id", statType[i]);
        if(i == 0){
          stat.innerHTML = statType[i]+": "+careerAvg['ppg'];
        }else if(i == 1){
          stat.innerHTML = statType[i]+": "+careerAvg['rpg'];
        }else if(i == 2){
          stat.innerHTML = statType[i]+": "+careerAvg['apg'];
        }else if(i == 3){
          stat.innerHTML = statType[i]+": "+careerAvg['spg'];
        }else if(i == 4){
          stat.innerHTML = statType[i]+": "+careerAvg['bpg'];
        }
        cardText.appendChild(stat);
      }
      var lastNode = card.children[1];
      card.insertBefore(cardText, lastNode);
    }
    var Plist = document.getElementById("Plist");
    Plist.appendChild(card);

    PIDs.push(playerID);
    playerContent.set(playerID, playerData);
    //put PIDs in storage after adding a new PID
    localforage.setItem('PIDs', PIDs).then(function (value) {
      // Do other things once the value has been saved.
      console.log(value);
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });
  }
}

function expand(obj) {
    // player info from
    var player = obj.getElementsByClassName("mdl-card__title mdl-card--expand");
    playerName = player[0].innerText;
    playerID = player[0].firstChild.id;
    playerData.name = playerName;
    playerData.carAvg = careerAvg;

    var avgBodyRow = document.getElementById("avgTableBody");
    avgBodyRow.innerHTML = "";
    var dialog = document.querySelector('#modal-example');

    //title of dialog - Player Name
    var dialogTitle = dialog.getElementsByClassName("mdl-dialog__title")[0];
    if(dialogTitle.children.length == 1){
      var title = dialogTitle.getElementsByTagName("h2")[0];
      title.innerHTML = "";
      title.innerHTML = playerName;
      title.id= playerID;
    } else {
      var title = document.createElement("h2");
      title.innerHTML = playerName;
      title.setAttribute("id", playerID);
      dialogTitle.appendChild(title);
    }
    var seasonAvgsArr =[];
    var averages = iterater[0]['regularSeason']['season'];

    //header for Averages
    var avgRow = document.getElementById("avgTableHead");
    avgRow.innerHTML = "";
    var headers = ["Year","Team","ppg", "rpg", "apg", "spg", "bpg"];
    var tr = document.createElement("tr");
    for (var i = 0; i < 7; i++) {
      var th = document.createElement("th");
      th.setAttribute("class", "mdl-data-table__cell--non-numeric");
      th.innerHTML = headers[i];
      tr.appendChild(th);
    }
    avgRow.appendChild(tr);
    var mostRecentTeam = "";
    //Stats in Averages Body
    for (var i = 0; i < averages.length; i++) {
      var seasonavg = {'year':0,'team':"", "ppg":0, "rpg":0, "apg":0, "spg":0, "bpg":0}
      var season = averages[i];
      var tr = document.createElement("tr");
      for (var j = 0; j < 7; j++) {
        var year = season['seasonYear'];
        var stats = season['teams'][0];
        var td = document.createElement("td");
        if(j == 0){
          th.setAttribute("class", "mdl-data-table__cell--non-numeric");
          td.innerHTML = year;
          seasonavg.year = year;
        } if(j == 1){
          td.setAttribute("class", "mdl-data-table__cell--non-numeric");
          td.innerHTML = teams.get(stats['teamId'])[0];
          mostRecentTeam = stats['teamId'];
          seasonavg.team = teams.get(stats['teamId'])[0];;
        } if(j == 2) {
          td.innerHTML = stats['ppg'];
          seasonavg.ppg = stats['ppg'];
        } if(j == 3) {
          td.innerHTML = stats['rpg'];
          seasonavg.rpg = stats['rpg'];
        } if(j == 4) {
          td.innerHTML = stats['apg'];
          seasonavg.apg = stats['apg'];
        } if(j == 5) {
          td.innerHTML = stats['spg'];
          seasonavg.spg = stats['spg'];
        } if(j == 6) {
          td.innerHTML = stats['bpg'];
          seasonavg.bpg = stats['bpg'];
        }
        tr.appendChild(td);
      }
      seasonAvgsArr.push(seasonavg);
      avgBodyRow.appendChild(tr);
    }
    playerData.seasAvg = seasonAvgsArr;
    //adds player Profile to the map of the players identified using the PlayerID
    //PLayerID => PlayerProfile
    playerContent.set(playerID, playerData);

    //save Players to local storage
    localforage.setItem("players", playerContent).then(function(value) {
      console.log("saved selected playerProfiles");
    }).catch(function(err){
      console.log(err);
    });

    //teamSchedule
    var getTS = new XMLHttpRequest();
    var teamScheduleURL = url+currYear+'teams/'+teams.get(stats['teamId'])[1]+teamSchedule;
    requestData(getTS, teamScheduleURL);
    var playedGames =[];
    //list of games played so far
    getTS.onload = function() {
      var data = getTS.response;
      var data = data['league']['standard'];
      for (var i = 0; i < data.length; i++) {
        var game = data[i];
        if(game['statusNum'] == 3){
          playedGames.push({'ID':game['gameId'],'Date':game['startDateEastern']})

          //get Boxscore for player
          var boxscoreURL = url+game['startDateEastern']+'/'+game['gameId']+boxscore;
          // console.log(boxscoreURL);
          // var getBScore = new XMLHttpRequest();
          // requestData(getBScore, boxscoreURL);
          // getBScore.onload = function(){
          //   console.log(getBScore.status);
          //   var data = getBScore.response;
          //   console.log(data);
          // }
        }
      }
    }

    //get Player GAMELog
    // var getPGL = new XMLHttpRequest();
    // getPGL.open('GET', url+playerURL+playerID+playerGameLog, true);
    // getPGL.responseType = 'json';
    // getPGL.send();
    // getPGL.onload = function(){
    //   var gameLog = getPGL.response;
    //   var iterater = [];
    //   iterater.push(gameLog['league']['standard']);
    //   console.log(iterater[0]);
    // }

    var closeButton = dialog.querySelector('button');
    // var showButton = document.querySelector('#show-modal-example');
    var openClickHandler = function(event) {
        dialog.showModal();
    };
    dialog.showModal();
    if (! dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    var closeClickHandler = function(event) {
        dialog.close();
    };
    closeButton.addEventListener('click', closeClickHandler);
}
