import { Component } from "@angular/core";
import {  NavController, NavParams } from "ionic-angular";
import * as firebase from "firebase";
import { ToastController } from "ionic-angular/components/toast/toast-controller";
import { ViewController } from "ionic-angular/navigation/view-controller";
import { AlertController } from "ionic-angular/components/alert/alert-controller";


@Component({
  selector: "page-select-game",
  templateUrl: "select-game.html"
})
export class SelectGamePage {
  spellcheck = false;
  quiz = false;
  story = false;
  startWithEnd = false;

  miniGames: any;

  level = 1;
  roomId;
  playerUid;
  room: any;
  player: any;
  refRooms = firebase.database().ref("rooms/");
  refPlayers = firebase.database().ref("players/");
  refGenres = firebase.database().ref("games/story/genres/");
  refMessages: any;
  refGames;
  games = {
    spellcheck: false,
    quiz: false,
    story: false,
    startWithEnd: false
  };

  isHost = false;

  genres = [];

  wordOrLeter = "Word/Leter";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController
  ) {}

  toggleSpellCheck(checked) {
    if (this.games.spellcheck != checked) {
      this.refGames.child("spellcheck").set(checked);
      if (this.refMessages && checked) {
        this.refMessages.push({
          from: "chat-bot",
          text: "Spell Check is now activated",
          date: new Date().getTime()
        });
      }
    }
  }

  toggleQuiz(checked) {
    if (this.games.quiz != checked) {
      this.refGames.child("quiz").set(checked);
      if (this.refMessages && checked) {
        this.refMessages.push({
          from: "chat-bot",
          text: "Quiz is now activated",
          date: new Date().getTime()
        });
      }
    }
  }

  toggleStory(checked) {
    if (
      (this.games.story != false && !checked) ||
      (checked && this.games.story == false)
    ) {
      if (!checked) {
        this.refGames.child("story").set(false);
      } else if (this.refMessages && checked) {
        this.selectGenre(this.genres, genre => {
          this.refGames.child("story").set(genre);
        });

        this.refMessages.push({
          from: "chat-bot",
          text: "Improv Story is now activated",
          date: new Date().getTime()
        });
      }
    }
  }

  toggleStartWithEnd(checked) {
    if (
      (this.games.startWithEnd != false && !checked) ||
      (checked && this.games.startWithEnd == false)
    ) {
      if (!checked) {
        this.refGames.child("startWithEnd").set(false);
        this.wordOrLeter = "Word/Leter";
      } else if (this.refGames && checked) {
        this.selectLast(last => {
          this.refGames.child("startWithEnd").set(last);
          this.refMessages.push({
            from: "chat-bot",
            text: "Start With The last " + last + " is now activated",
            date: new Date().getTime()
          });
        });
      }
    }
  }

  validate() {
    this.refRooms
      .child(this.roomId)
      .child("level")
      .set(this.level);
    this.quiz = this.miniGames == "quiz";
    this.story = this.miniGames == "story";
    this.startWithEnd = this.miniGames == "startWithEnd";

     console.log(this.miniGames, this.spellcheck, this.quiz, this.story, this.startWithEnd)
     
    this.toggleStory(this.story);
    this.toggleQuiz(this.quiz);
    this.toggleStartWithEnd(this.startWithEnd);
    this.toggleSpellCheck(this.spellcheck);

    this.showToast("Success", "Room is updated");
  }

  ionViewDidLoad() {
    this.roomId = this.navParams.data.roomId;
    this.playerUid = this.navParams.data.playerUid;
    this.isHost = this.navParams.data.isHost;
    console.log(this.isHost);
    if (this.roomId) {
      this.refMessages = this.refRooms.child(this.roomId + "/messages");
    }
    this.loadData(this.roomId, this.playerUid);
  }

  loadData(roomId, playerUid) {
    this.refGames = this.refRooms.child(roomId).child("games/");

    this.refGames.on("value", s => {
      if (s.val()) {
        this.games = s.val();
        this.spellcheck = this.games.spellcheck;
        this.quiz = this.games.quiz ? true : false;
        this.story = this.games.story ? true : false;
        this.startWithEnd = this.games.startWithEnd ? true : false;
        switch (this.games.startWithEnd.toString()) {
          case "leter":
            this.wordOrLeter = "Leter";
            break;
          case "word":
            this.wordOrLeter = "Word";
            break;
          default:
            this.wordOrLeter = "Word/Leter";
            break;
        }
        switch (true) {
          case this.story != false:
            this.miniGames = "story";
            break;
          case this.quiz:
            this.miniGames = "quiz";
            break;
          case this.startWithEnd != false:
            this.miniGames = "startWithEnd";
            break;
          default:
            this.miniGames = "nil";
        }
      }

      this.refGenres.once("value", s => {
        this.genres = s.val();
      });
    });
    this.refRooms
      .child(roomId)
      .child("level")
      .on("value", s => {
        this.level = s.val() ? s.val() : 0;
      });
    this.refPlayers.child(playerUid).on("value", s => {
      this.player = { ...s.val() };
    });
  }

  showToast(title, text) {
    const toast = this.toastCtrl.create({
      message: text,
      showCloseButton: true,
      closeButtonText: title,
      duration: 1500
    });
    toast.present();
    // this.viewCtrl.dismiss();
  }

  clearChatBotHistory() {
    this.refMessages
      .orderByChild("from")
      .equalTo("chat-bot")
      .once("value", s => {
        if (s.val()) {
          Object.keys(s.val()).forEach((key, index, arr) => {
            if (index < arr.length - 3) this.refMessages.child(key).remove();
          });
        }
      });
    this.viewCtrl.dismiss();
  }

//   selection(type, needed  ,cb){
//      if(type == "genre"){
//         this.selectGenre(needed, ret => {
//            cb(ret);
//         })
//      }else if(type == "last"){
//         this.selectLast(needed, ret => {
//            cb(ret);
//         })
//      }
//   }
   
  selectGenre(genres, cb) {
    let alert = this.alertCtrl.create({
      enableBackdropDismiss: false
    });
    alert.setTitle("What do you want to write");

    for (let i = 1; i < genres.length; i++) {
      const item = genres[i];
      alert.addInput({
        type: "radio",
        label: item,
        value: i.toString(),
        checked: false
      });
    }

    alert.addInput({
      type: "radio",
      label: "Write your own story",
      value: "100",
      checked: true
    });

    alert.addButton({
      text: "Once upon a time",
      handler: data => {
        cb(data);
      }
    });
    alert.present();
  }

  selectLast(cb) {
    let alert = this.alertCtrl.create({
      enableBackdropDismiss: false
    });

    alert.setTitle("Start with the last leter or word?");

    alert.addInput({
      type: "radio",
      label: "Leter, easy but less rewarding",
      value: "leter",
      checked: true
    });

    alert.addInput({
      type: "radio",
      label: "Word, difficult but more rewarding",
      value: "word",
      checked: false
    });

    alert.addButton({
      text: "Shall we begin",
      handler: data => {
        cb(data);
      }
    });
    alert.present();
  }
}
