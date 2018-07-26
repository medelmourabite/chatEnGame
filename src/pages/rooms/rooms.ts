import { TipsPage } from "./../tips/tips";
import { InvitationsPage } from "./../invitations/invitations";
import { snapShotToArray, showHints } from "./../../utils/utils";
import { AddRoomPage } from "./../add-room/add-room";
import { RoomPage } from "./../room/room";
import { AuthService } from "./../../services/auth.service";
import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  App,
  AlertController,
  Item,
  ItemSliding
} from "ionic-angular";
import * as firebase from "firebase";
import { snapShotToArray2 } from "../../utils/utils";
import { PopoverController } from "ionic-angular/components/popover/popover-controller";
import { ModalController } from "ionic-angular/components/modal/modal-controller";

// @IonicPage()
@Component({
  selector: "page-rooms",
  templateUrl: "rooms.html"
})
export class RoomsPage {
  refRooms = firebase.database().ref("rooms/");
  refPlayers = firebase.database().ref("players/");
  playerUid: string;
  friends = [];
  myRooms = [];
  bannedRooms = [];
  rooms = [];
  items = [];

  player: any;
  players = [];
  notifs = 0;

  activeItemSliding: ItemSliding = null;

  options = "my_rooms";
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    public app: App,
    public alertCtrl: AlertController,
    public popoverCtrl: PopoverController,
    public mdlCtrl: ModalController
  ) {}

  ionViewDidLoad() {
    this.auth.afAuth.authState.subscribe(
      user => {
        this.playerUid = user.uid;
        this.loadData(user.uid);
      },
      er => {
        // console.log(er);
      }
    );
  }

  getRooms(ev) {
    const val = ev.target.value;

    if (val && val.trim() != "") {
      var i = 0;
      this.items = this.rooms.filter(item => {
        let banned = false;
        if (item.bannedPlayers) {
          banned =
            Object.keys(item.bannedPlayers).indexOf(this.player.uid) > -1;
        }
        i++;
        return (
          i < 20 &&
          item.name.toLowerCase().indexOf(val.toLowerCase()) > -1 &&
          item.level <= this.player.level &&
          !banned
        );
      });
    }
  }

  loadData(playerUid) {
    this.refRooms
      .orderByChild("hostuid")
      .equalTo(playerUid)
      .on("value", snapshot => {
        this.myRooms = snapShotToArray(snapshot);
      });

    this.refRooms.on("value", snapshot => {
      this.rooms = snapShotToArray(snapshot);

      var i = 0;
      this.items = this.rooms.filter(item => {
        let banned = false;
        if (item.bannedPlayers) {
          banned =
            Object.keys(item.bannedPlayers).indexOf(this.player.uid) > -1;
        }
        i++;
        return i < 10 && item.level <= this.player.level && !banned;
      });
    });

    this.refPlayers
      .child(playerUid)
      .child("friends")
      .on("value", s => {
        let fr = snapShotToArray2(s);
        this.friends = [];
        let tmp = [];
        fr.forEach(item => {
          this.refPlayers.child(item).once("value", s => {
            if (s.val()) {
              let player = {
                uid: item,
                name: s.val().name,
                level: s.val().level
              };
              tmp.push(player);
            }
          });
        });
        this.friends = tmp;
      });

    this.refPlayers.child(playerUid).on("value", s => {
      this.player = { ...s.val() };
      this.player["uid"] = playerUid;

      if (this.player.invitations)
        this.notifs = Object.keys(this.player.invitations).length;
      else this.notifs = 0;
    });

    this.refPlayers.child(playerUid + "/new").once("value", snapshot => {
      let newU = { ...snapshot.val() };
      if (newU && newU.rooms) {
        showHints(
          this.mdlCtrl,
          playerUid,
          "rooms",
          "In this list",
          "Slide to see more options",
          "25%",
          null,
          "10%",
          "10%"
        );
      }
    });
    this.refPlayers.on("value", s => {
      this.players = [];
      if (s.val()) {
        Object.keys(s.val()).forEach(item => {
          let user = s.val()[item];
          user["uid"] = item;
          this.players[item] = user;
        });
      }
    });
  }

  addRoom() {
    this.app.getRootNav().push(AddRoomPage);
  }

  joinRoom(roomKey) {
    this.app.getRootNav().push(RoomPage, {
      roomKey: roomKey,
      playerUid: this.playerUid
    });
  }

  deleteRoom(roomId) {
    this.refRooms.child(roomId).set(null);
  }

  inviteFriends(roomKey, level) {
    let alert = this.alertCtrl.create();
    if (this.friends.length > 0) {
      alert.setTitle("Which friends do you want to play with?");
      this.friends.forEach(item => {
        if (item.level >= level)
          alert.addInput({
            type: "checkbox",
            label: item.level + " : " + item.name,
            value: item.uid,
            checked: false
          });
      });
    } else {
      alert.setTitle("You need to add more friends!");
    }

    alert.addButton("Cancel");
    alert.addButton({
      text: "Okay",
      handler: data => {
        if (data)
          data.forEach(player => {
            this.refPlayers
              .child(player)
              .child("invitations")
              .push({
                room: roomKey,
                from: this.playerUid,
                seen: false
              });
          });
      }
    });
    alert.present();
  }

  presentPopover(ev) {
    if (this.notifs > 0) {
      let popover = this.popoverCtrl.create(InvitationsPage, {
        playerUid: this.playerUid
      });
      popover.present({
        ev
      });
    }
  }

  showTips(game) {
    let mdl = this.mdlCtrl.create(TipsPage, { game });
    mdl.present();
  }

  openOption(itemSlide: ItemSliding, item: Item, swipeAmount = 40) {
    if (this.activeItemSliding !== null)
      //use this if only one active sliding item allowed
      this.closeOption();

    this.activeItemSliding = itemSlide;

    itemSlide.startSliding(swipeAmount);
    itemSlide.moveSliding(swipeAmount);

    itemSlide.setElementClass("active-options-right", true);
    itemSlide.setElementClass("active-swipe-right", true);

    item.setElementStyle("transition", null);
    item.setElementStyle(
      "transform",
      "translate3d(-" + swipeAmount + "%, 0px, 0px)"
    );
  }

  closeOption() {
    if (this.activeItemSliding) {
      this.activeItemSliding.close();
      this.activeItemSliding = null;
    }
  }
}
