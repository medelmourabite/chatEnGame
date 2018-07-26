import { ProfilePage } from "./../profile/profile";
import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  ViewController,
  App,
  ToastController
} from "ionic-angular";
import * as firebase from "firebase";

@Component({
  selector: "page-active-players",
  templateUrl: "active-players.html"
})
export class ActivePlayersPage {
  players = [];
  bannedPlayers = [];

  roomId = "";
  playerUid = "";
  isHost = false;
  host = "";

  refRooms = firebase.database().ref("rooms/");
  refPlayers = firebase.database().ref("players/");

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController
  ) {
    this.players = this.navParams.data.players;
    this.bannedPlayers = this.navParams.data.bannedPlayers;

    this.playerUid = this.navParams.data.playerUid;
    this.host = this.navParams.data.host;
    this.isHost = this.navParams.data.host == this.navParams.data.playerUid;
    this.roomId = this.navParams.data.roomId;
  }

  ionViewDidLoad() {}

  close() {
    this.viewCtrl.dismiss();
  }

  visitProfile(uid) {
    if (this.playerUid != uid) {
      this.app.getRootNav().push(ProfilePage, {
        uid
      });
    } else {
      this.app.getRootNav().push(ProfilePage);
    }
    this.close();
  }

  removeFromRoom(playerUid) {
    if (this.roomId) {
      this.refRooms
        .child(this.roomId)
        .child("players/" + playerUid)
        .set(null);
      this.refRooms
        .child(this.roomId)
        .child("bannedPlayers/" + playerUid)
        .set(playerUid);

      this.refPlayers
        .child(playerUid)
        .child("invitations")
        .orderByChild("room")
        .equalTo(this.roomId)
        .once("value", s => {
          if (s.val()) {
            Object.keys(s.val()).forEach(invit => {
              this.refPlayers
                .child(playerUid)
                .child("invitations")
                .set(null);
            });
          }
        });
      this.showToast("Remove", "User removed");
      this.close();
    }
  }

  cancelBanne(playerUid) {
    if (this.roomId) {
      this.refRooms
        .child(this.roomId)
        .child("bannedPlayers/" + playerUid)
        .set(null);

      this.showToast("Cancel", "User can access this room");
      this.close();
    }
  }

  report(playerUid) {
    this.refPlayers
      .child(playerUid)
      .child("reports/")
      .push({
        from: this.playerUid,
        room: this.roomId
      });
    this.showToast("Report", "User reported");
    this.close();
  }

  showToast(title, text) {
    const toast = this.toastCtrl.create({
      message: text,
      showCloseButton: true,
      closeButtonText: title,
      duration: 2000,
      position: "middle"
    });
    toast.present();
  }
}
