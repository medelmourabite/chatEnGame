import { RoomPage } from "./../room/room";
import { Component } from "@angular/core";
import {
  
  NavController,
  NavParams,
  App,
  ViewController
} from "ionic-angular";
import { AuthService } from "../../services/auth.service";
import * as firebase from "firebase";
import { snapShotToArray } from "../../utils/utils";

// @IonicPage()
@Component({
  selector: "page-invitations",
  templateUrl: "invitations.html"
})
export class InvitationsPage {
  invitations = [];
  rooms = [];
  players = [];
  refPlayers = firebase.database().ref("players/");
  refRooms = firebase.database().ref("rooms/");
  playerUid: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    auth: AuthService,
    public app: App,
    public viewCtrl: ViewController
  ) {
    auth.afAuth.authState.subscribe(
      user => {
        this.playerUid = user.uid;
        if (!user) {
          return null;
        }
        this.loadData(this.playerUid);
      },
      () => {}
    );
  }

  loadData(uid) {
    this.refPlayers.child(uid + "/invitations").on("value", s => {
      this.invitations = snapShotToArray(s);
      this.invitations.forEach(invit => {
        this.refPlayers.child(invit.from).on("value", s => {
          this.players[invit.from] = s.val();
        });
        this.refRooms.child(invit.room).on("value", s => {
          this.rooms[invit.room] = s.val();
        });
      });
    });
  }

  joinRoom(invit) {
    this.refPlayers
      .child(this.playerUid)
      .child("invitations/" + invit.key)
      .child("seen")
      .set(true);
    this.app.getRootNav().push(RoomPage, {
      roomKey: invit.room,
      playerUid: this.playerUid
    });
    this.close();
  }

  seen(invit) {
    this.refPlayers
      .child(this.playerUid)
      .child("invitations/" + invit)
      .set(null);
  }

  removeAll() {
    this.refPlayers
      .child(this.playerUid)
      .child("invitations/")
      .set(null);

    this.close();
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
