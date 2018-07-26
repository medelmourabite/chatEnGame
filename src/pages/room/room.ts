import { ModalController } from "ionic-angular/components/modal/modal-controller";
import { TabsPage } from "./../tabs/tabs";
import { ProfilePage } from "./../profile/profile";
import { SelectGamePage } from "./../select-game/select-game";
import { snapShotToArray, showHints } from "./../../utils/utils";
import { AuthService } from "./../../services/auth.service";
import { Component, ViewChild } from "@angular/core";
import {
  NavController,
  NavParams,
  AlertController,
  ToastController,
  Content,
  PopoverController,
  App
} from "ionic-angular";
import * as firebase from "firebase";
import io from "socket.io-client";
import { ActivePlayersPage } from "../active-players/active-players";

// @IonicPage()
@Component({
  selector: "page-room",
  templateUrl: "room.html"
})
export class RoomPage {
  @ViewChild("messageText") messageText;

  socket: any;
  refRooms = firebase.database().ref("rooms/");
  refPlayers = firebase.database().ref("players/");
  refLevels = firebase.database().ref("levels/");
  refPlayer: any;
  refMessages = null;
  room = {
    key: "",
    name: "",
    hostuid: "",
    level: 1,
    players: [],
    messages: [],
    games: {
      spellcheck: false,
      quiz: false,
      startWithEnd: false,
      story: false
    },
    bannedPlayers: []
  };
  messages = [];
  players = [];
  player = {};
  message = { text: "", from: "", date: 0, isCorrect: true, suggestions: [] };
  chatBot = {
    uid: "chat-bot",
    email: "",
    name: "BOT",
    level: "",
    photo: "assets/imgs/chatbot.png"
  };
  levels = [];

  connected = true;

  online = 0;
  offset = 20;

  turn: string;

  bannedPlayers = [];

  @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public popoverCtrl: PopoverController,
    public app: App,
    public mdlCtrl: ModalController
  ) {
    this.room.key = navParams.data.roomKey;
    this.socket = io.connect(
      //       "http://localhost:8888", // Local Test server
      "http://chat-eng-game-socket-server.herokuapp.com",
      {
        "reconnection limit": 5000,
        "max reconnection attempts": 5
      }
    );
  }

  ionViewDidLoad() {
    this.refMessages = firebase
      .database()
      .ref("rooms/")
      .child(this.room.key + "/")
      .child("messages/");

    this.auth.afAuth.authState.subscribe(
      user => {
        this.player["uid"] = user.uid;
        this.loadData(user.uid);

        this.entering(user.uid);
      },
      er => {
        console.log("ERREUR");
      }
    );
  }

  updateScore(w, e) {
    let score = w - 3 * e;

    if (score < 0) {
      score = 0;
    }

    this.refPlayer.once("value", s => {
      let points = s.val().points + score;
      let levelId = s.val().level;
      let level = this.levels[levelId];
      if (points > level.xp) {
        points -= level.xp;
        levelId++;
        this.refPlayer.child("level").set(levelId);
        this.showAlert("Level Up", "you have reached level " + levelId);
        if (this.room.hostuid == this.player["uid"]) {
          this.showAlert("Room", "Now you can upgrade your room");
        }
      }
      this.refPlayer.child("points").set(points);
    });
  }

  getLevel(points, level) {}

  addPlayer(playerUid) {
    this.refRooms
      .child(this.room.key)
      .child("players/" + playerUid)
      .set(playerUid);
    this.refPlayers.child(playerUid + "/state").set("online");
  }

  removePlayer(playerUid) {
    if (playerUid)
      this.refRooms
        .child(this.room.key)
        .child("players/" + playerUid)
        .set(null);
  }

  loadData(uid) {
    this.refPlayer = this.refPlayers.child(uid + "/");
    this.message.from = uid;

    this.refRooms.child(this.room.key).on("value", snapshot => {
      const val = { ...snapshot.val() };
      this.room.key = this.room.key;
      this.room.name = val.name;
      this.room.hostuid = val.hostuid;
      this.room.level = val.level;

      this.room["bannedPlayers"] = [];

      if (val && val.bannedPlayers != null) {
        Object.keys(val.bannedPlayers).forEach(item => {
          if (uid == item) {
            this.showAlert("Banned", "you can't access this room anymore");
            this.app.getRootNav().push(TabsPage);
            return;
          }
          this.room["bannedPlayers"].push(item);
        });
      }

      if (val.players == null) this.room.players = [];
      else {
        this.room.players = Object.keys(val.players);
        this.online = this.room.players.length;
      }
    });

    this.refRooms.child(this.room.key + "/games").on("value", snapshot => {
      let games = snapshot.val();

      if (games) {
        if (games.checkspell) {
        }
        if (games.quiz) {
          this.turn = this.player["uid"];
        } else if (games.story) {
          this.turn = "";
        } else if (games.startWithEnd) {
          this.turn = this.player["uid"];
        }
      }
      this.room.games = games;
    });
    this.refPlayers.on("value", s => {
      this.players = [];
      if (s.val()) {
        Object.keys(s.val()).forEach(player => {
          let user = { ...s.val()[player] };
          user["uid"] = player;
          if (user.reports) {
            user.reports = Object.keys(user.reports).filter(item => {
              let report = user.reports[item];
              return report.room == this.room.key;
            });
          } else {
            user["reports"] = [];
          }
          this.players[player] = user;
        });
      }
    });

    this.refPlayer.on("value", snapshot => {
      let user = { ...snapshot.val() };
      user["uid"] = uid;
      this.player = user;
    });

    this.refPlayer.child("new").once("value", snapshot => {
      let newU = { ...snapshot.val() };
      if (newU && newU.room) {
        showHints(
          this.mdlCtrl,
          uid,
          "room",
          "Click here",
          "To see available games",
          "8%",
          null,
          null,
          "0%"
        );
      }
    });

    this.refLevels.on("value", s => {
      this.levels = snapShotToArray(s);
    });

    this.refMessages.on("child_added", s => {
      setTimeout(() => {
        try {
          if (this.content) this.content.scrollToBottom(200);
        } catch (ex) {}
      }, 500);
    });

    this.refRooms
      .child(this.room.key)
      .child("messages")
      .orderByChild("date") // .startAt(this.getToday(this.offset))      // .endAt(this.getToday(--this.offset))
      .limitToLast(this.offset)
      .on("value", s => {
        let messages = [];
        let tmp = s.val();

        if (!tmp) tmp = {};
        Object.keys(tmp).forEach(function(key) {
          messages.push(tmp[key]);
        });
        this.room.messages = messages;
      });
  }

  entering(uid) {
    this.addPlayer(uid);

    this.socket.on("connect", () => {
      if (!this.connected) {
        this.showAlert("Connected", "You are connected to the chat server");
      }
      this.connected = true;
      this.socket.emit("join", {
        room: this.room.key,
        player: uid
      });
    });

    this.socket.on("connect_error", error => {
      if (this.connected) {
        this.showAlert(
          "Sorry! Connection error",
          "We can't access the chat server"
        );
      }
      this.connected = false;
    });

    this.socket.on("message", message => {
      let nbrWords = message.text
        .replace(/[,.*+?^${}()|[\]\\]/g, " ")
        .split(" ").length;

      if (!message.suggestions) message.suggestions = [];
      let nbrErrors = message.suggestions.length;

      nbrWords =
        this.room && this.room.games && this.room.games.spellcheck
          ? nbrWords
          : 1;

      if (nbrErrors > 0) {
        let msg = message.text;
        let i = 0;
        message.suggestions.forEach((word, index, arr) => {
          this.showSuggestions(word, correct => {
            msg = msg.replace(word.word, correct);
            i++;
            if (i == arr.length) {
              message.text = msg;
              this.refMessages.push(message);
              this.updateScore(nbrWords, nbrErrors);
              this.socket.emit("correct_message", {
                message: message,
                room: this.room.key
              });
            }
          });
        });
      } else {
        this.updateScore(nbrWords, nbrErrors);
        this.socket.emit("correct_message", {
          message: message,
          room: this.room.key
        });
        this.refMessages.push(message);
      }
      this.message.text = "";
    });

    this.socket.on("your_turn", data => {
      this.turn = data.uid;
      if (this.turn == this.player["uid"]) {
        this.showToast("You turn", "Do you job Master Storyteller");
      }
    });

    this.socket.on("ready", msg => {
      this.showToast(msg.title, msg.text);
    });

    this.socket.on("correct", msg => {
      this.showToast(msg.title, msg.text);
    });

    this.socket.on("congrat", msg => {
      this.showToast(msg.title, msg.text);
      this.updateScore(msg.gain, 0);
    });

    this.socket.on("wrong", msg => {
      this.showToast(msg.title, msg.text);
    });
  }

  ionViewWillUnload() {
    this.removePlayer(this.player["uid"]);
    this.socket.emit("leave", {
      room: this.navParams.data.roomKey,
      player: this.player["uid"]
    });
  }

  loadMoreMessage(refresher) {
    this.offset += 5;

    this.refRooms
      .child(this.room.key)
      .child("messages")
      .orderByChild("date")
      .limitToLast(this.offset)
      .once("value", s => {
        let messages = [];
        let tmp = s.val();

        if (!tmp) tmp = {};
        Object.keys(tmp).forEach(function(key) {
          messages.push(tmp[key]);
        });
        this.room.messages = messages;
      });

    setTimeout(() => {
      refresher.complete();
    }, 1000);
  }

  showToast(title, text) {
    const toast = this.toastCtrl.create({
      message: text,
      showCloseButton: true,
      closeButtonText: title,
      duration: 2000,
      position: title == "ready" ? "middle" : "top"
    });
    toast.present();
    toast.onDidDismiss(() => {
      this.messageText.setFocus();
    });
  }

  showAlert(title, text) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: text,
      buttons: ["OK"]
    });
    alert.present();
    setTimeout(function() {
      alert.dismiss;
    }, 2000);
  }

  sendMessage(input) {
    if (
      this.message.text.trim() == "" ||
      (this.room.games &&
        this.room.games.story &&
        this.turn != this.player["uid"])
    ) {
      return;
    }
    this.message.date = new Date().getTime();
    if (this.connected) {
      this.socket.emit("message", {
        message: this.message,
        room: this.room.key
      });
    } else {
      this.refMessages.push(this.message);
    }
    this.message.text = "";
    input.setFocus();
  }

  showSuggestions(word, cb) {
    let alert = this.alertCtrl.create({
      enableBackdropDismiss: false
    });
    alert.setTitle("Correct " + word.word);

    if (word.suggestions.length <= 0) {
      cb(word.word);
      return;
    }

    word.suggestions.forEach(item => {
      alert.addInput({
        type: "radio",
        label: item,
        value: item,
        checked: false
      });
    });

    alert.addInput({
      type: "radio",
      label: word.word,
      value: word.word,
      checked: true
    });

    alert.addButton({
      text: "OK",
      handler: data => {
        cb(data);
      }
    });
    alert.present();
  }

  presentPopover(ev, isHost) {
    let popover = this.popoverCtrl.create(SelectGamePage, {
      roomId: this.room.key,
      playerUid: this.player["uid"],
      isHost
    });

    popover.present({
      ev
    });
  }

  getOnlinePlayers(players) {}

  showActivePlayers(ev) {
    let tmp = [];
    let bannedPlayers = [];
    for (let t in this.players) {
      if (
        this.room.players.indexOf(t) > -1 &&
        this.players[t]["state"] == "online"
      ) {
        tmp.push(this.players[t]);
      } else if (
        this.room.players.indexOf(t) > -1 &&
        this.players[t]["state"] == "online"
      ) {
        this.removePlayer(t);
      } else if (this.room.bannedPlayers.indexOf(t) > -1)
        bannedPlayers.push(this.players[t]);
    }

    this.online = tmp.length;

    if (this.online > 0) {
      let popover = this.popoverCtrl.create(ActivePlayersPage, {
        players: tmp,
        bannedPlayers,
        roomId: this.room.key,
        isHost: this.room.hostuid == this.player["uid"],
        host: this.room.hostuid,
        playerUid: this.player["uid"]
      });

      popover.present({
        ev
      });
    }
  }

  visitProfile(playerUid) {
    this.app.getRootNav().push(ProfilePage, {
      playerUid
    });
  }

  typing() {
    this.socket.emit("typing", {
      room: this.room.key,
      player: this.turn
    });
  }

  getToday(offset) {
    let date = new Date();
    let d = date.getDay() - offset;
    let m = date.getMonth();
    let y = date.getFullYear();
    return new Date(y, m, d, 0, 0, 1).getTime();
  }
}
