import { AuthService } from "./../../services/auth.service";
import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import * as firebase from "firebase";
import { ToastController } from "ionic-angular/components/toast/toast-controller";
// @IonicPage()
@Component({
  selector: "page-add-room",
  templateUrl: "add-room.html"
})
export class AddRoomPage {
  room = { name: "", hostuid: "", level: 0, description: "", players: [] };
  refRooms = firebase.database().ref("rooms/");
  refPlayers = firebase.database().ref("players/");
  player = { uid: "", name: "", level: "" };
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    public toastCtrl: ToastController
  ) {
    this.player.uid = auth.getUid();
  }

  ionViewDidLoad() {
    this.refPlayers.child(this.auth.getUid()).on("value", snapshot => {
      const val = { ...snapshot.val() };
      this.player.uid = this.auth.getUid();
      this.player.level = val.level;
    });
  }

  addRoom() {
    this.refRooms
      .orderByChild("name")
      .equalTo(this.room.name)
      .once("value", s => {
        if (!s.exists()) {
          let newData = this.refRooms.push();
          newData.set({
            name: this.room.name,
            hostuid: this.player.uid,
            level: this.room.level,
            description: this.room.description,
            players: [],
            messages: [
              {
                text: "Welcome",
                date: new Date().getTime(),
                from: "chat-bot"
              },
              {
                text: "I'm The Chat-Bot",
                date: new Date().getTime(),
                from: "chat-bot"
              },
              {
                text: "And i will be your tutor in this room",
                date: new Date().getTime(),
                from: "chat-bot"
              },
              {
                text:
                  "Select a game to start playing, or invite friends and start chating.",
                date: new Date().getTime(),
                from: "chat-bot"
              },
              {
                text: "If you need tips about a game, just click on it",
                date: new Date().getTime(),
                from: "chat-bot" 
              }
            ],
            games: {
              spellcheck: false,
              quiz: false,
              startWithEnd: false,
              story: false
            }
          });
          this.navCtrl.pop();
          this.showToast("Success", "The room is added");
        } else {
          this.showToast("Error", "The name already exists");
        }
      });
  }

  showToast(title, text) {
    const toast = this.toastCtrl.create({
      message: text,
      showCloseButton: true,
      closeButtonText: title,
      duration: 2000,
      position: "bottom"
    });
    toast.present();
  }
}
