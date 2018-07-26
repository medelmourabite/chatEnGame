import { ModalController } from "ionic-angular/components/modal/modal-controller";
import { LoginPage } from "./../login/login";
import { ProfilePage } from "./../profile/profile";
import { AuthService } from "./../../services/auth.service";
import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  PopoverController,
  App,
  ItemSliding,
  Item
} from "ionic-angular";
import * as firebase from "firebase";
import { snapShotToArray, showHints } from "../../utils/utils";
import { InvitationsPage } from "../invitations/invitations";

@Component({
  selector: "page-friends",
  templateUrl: "friends.html"
})
export class FriendsPage {
  options = "my_friends";
  player: any;
  players = [];
  items = [];
  myFriends = [];

  notifs = 0;

  refPlayers = firebase.database().ref("players/");

  activeItemSliding: ItemSliding = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    public popoverCtrl: PopoverController,
    public app: App,
    public mdlCtrl: ModalController
  ) {
    this.auth.afAuth.authState.subscribe(
      user => {
        if (user) this.loadData(user.uid);
        else this.app.getRootNav().push(LoginPage);
      },
      er => {
        console.log("ERREUR");
      }
    );
  }

  ionViewDidLoad() {}

  loadData(uid) {
    this.refPlayers.on("value", s => {
      this.players = snapShotToArray(s);

      this.player = s.val()[uid];
      this.player["uid"] = uid;

      if (this.player && this.player.invitations)
        this.notifs = Object.keys(this.player.invitations).length;
      else this.notifs = 0;

      if (!("friends" in this.player)) this.player.friends = [];
      this.myFriends = this.players.filter(item => {
        return this.player.friends[item.key];
      });

      var i = 0;
      this.items = this.players.filter(item => {
        i++;
        return (
          !this.player.friends[item.key] &&
          item.key != this.player.uid &&
          i < 10
        );
      });
    });

    this.refPlayers.child(uid + "/new").once("value", snapshot => {
      let newU = { ...snapshot.val() };
      if (newU && newU.profile) {
        showHints(
          this.mdlCtrl,
          uid,
          "friends",
          "In this list",
          "Slide to see more options",
          "25%",
          null,
          "10%",
          "10%"
        );
      }
    });
  }

  getPlayers(ev) {
    const val = ev ? ev.target.value : "";
    if (val && val.trim() != "") {
      if (!this.player.friends) this.player.friends = [];
      var i = 0;
      this.items = this.players.filter(item => {
        i++;
        return (
          item.name.toLowerCase().indexOf(val.toLowerCase()) > -1 &&
          !this.player.friends[item.key] &&
          item.key != this.player.uid &&
          i < 20
        );
      });
    }
  }

  removeFriend(friend) {
    this.refPlayers
      .child(this.player.uid)
      .child("friends/" + friend)
      .set(null);
  }
  addFriend(player) {
    // this.players[player]["added"] = true;
    // console.log(    this.players[player])
    this.refPlayers
      .child(this.player.uid)
      .child("friends/" + player)
      .set(player);
    this.items = this.items.filter(item => {
      return item.key != player;
    });
  }

  presentPopover(ev) {
    if (this.notifs > 0) {
      let popover = this.popoverCtrl.create(InvitationsPage, {
        playerUid: this.player.uid
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
