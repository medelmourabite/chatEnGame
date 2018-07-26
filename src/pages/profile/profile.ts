//import { HintsPage } from "./../hints/hints";
import { ModalController } from "ionic-angular/components/modal/modal-controller";
import { SocialSharing } from "@ionic-native/social-sharing";
import { InvitationsPage } from "./../invitations/invitations";
import { PopoverController } from "ionic-angular/components/popover/popover-controller";
import { Component } from "@angular/core";
import { NavController, NavParams, AlertController } from "ionic-angular";
import * as firebase from "firebase";
import { AuthService } from "../../services/auth.service";
import { snapShotToArray, showHints } from "../../utils/utils";
import { ToastController } from "ionic-angular/components/toast/toast-controller";

// @IonicPage()
@Component({
  selector: "page-profile",
  templateUrl: "profile.html"
})
export class ProfilePage {
  refPlayers = firebase.database().ref("players/");
  refRooms = firebase.database().ref("rooms/");
  refLevels = firebase.database().ref("levels/");
  player: any;
  notifs = 0;
  rooms = [];
  levels = [];
  level: any;
  test = 20;
  notifOnly: false;

  myProfile = true;
  isFriend = false;
  myUid = "";
  playerUid = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    public alertCtrl: AlertController,
    public popoverCtrl: PopoverController,
    public socialSharing: SocialSharing,
    public toastCtrl: ToastController,
    public mdlCtrl: ModalController
  ) {}

  ionViewDidLoad() {
    let playerUid = this.navParams.data.playerUid;
    if (playerUid && playerUid != "") {
      this.loadData(playerUid);
      this.auth.afAuth.authState.subscribe(
        user => {
          this.myUid = user.uid;
          this.myProfile = this.myUid == this.playerUid;

          this.playerUid = playerUid;
          this.updateNotif(user.uid, playerUid);
        },
        er => {
          console.log("ERREUR", "profile");
        }
      );
    } else {
      this.auth.afAuth.authState.subscribe(
        user => {
          this.myUid = user.uid;
          this.myProfile = true;
          this.loadData(user.uid);
        },
        er => {
          console.log("ERREUR", "profile");
        }
      );
    }
  }
  loadData(uid) {
    this.refPlayers.child(uid).on("value", snapshot => {
      let user = { ...snapshot.val() };

      if (user) {
        this.player = user;

        if (this.player.invitations)
          this.notifs = Object.keys(this.player.invitations).length;
        else this.notifs = 0;
      }
    });

    this.refLevels.on("value", s => {
      this.levels = snapShotToArray(s);
    });
    this.refPlayers.child(uid + "/new").once("value", snapshot => {
      let newU = { ...snapshot.val() };
      if (newU && newU.profile) {
        showHints(
          this.mdlCtrl,
          uid,
          "profile",
          "This is your avatar",
          "Click on it to change it",
          "40%",
          null,
          "10%",
          "10%"
        );
      }
    });
  }

  updateNotif(uid, playerUid) {
    this.refPlayers.child(uid).on("value", snapshot => {
      let invitations = snapshot.val().invitations;
      if (invitations) this.notifs = Object.keys(invitations).length;
      else this.notifs = 0;
      let fr = snapshot.val().friends;
      if (!fr) fr = {};
      Object.keys(fr).forEach(key => {
        if (playerUid == key) {
          this.isFriend = true;
        }
      });
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

  share(method) {
    let msg = `${this.player.name} : Check my score \nI have reached level ${
      this.levels[this.player.level].name
    }/${this.player.level} in this awesome game`;
    switch (method) {
      case "facebook":
        this.facebookShare(msg);
        break;
      case "whatsapp":
        this.whatsappShare(msg);
        break;
      case "twitter":
        this.twitterShare(msg);
        break;
      default:
        this.regularShare(msg);
    }
  }

  regularShare(msg) {
    this.socialSharing.share(msg, null, null, null);
    console.log("Sharing", msg);
  }

  whatsappShare(msg) {
    this.socialSharing.shareViaWhatsApp(msg, null, null);
    console.log("Watsapp", msg);
  }

  twitterShare(msg) {
    this.socialSharing.shareViaTwitter(msg, null, null);
    console.log("Twitter", msg);
  }

  facebookShare(msg) {
    this.socialSharing.shareViaFacebook(msg, null, null);
    console.log("Facebook", msg);
  }

  removeFriend() {
    this.refPlayers
      .child(this.myUid)
      .child("friends/" + this.playerUid)
      .set(null);
    this.isFriend = false;
    this.showToast("Delete", "Friend removed");
  }
  addFriend() {
    this.refPlayers
      .child(this.myUid)
      .child("friends/" + this.playerUid)
      .set(this.playerUid);
    this.showToast("Adding", "Friend added");
  }

  report() {
    this.refPlayers
      .child(this.playerUid)
      .child("reportToAdmins/")
      .push({
        from: this.myUid
      });
    this.showToast("Report", "user reported");
  }

  showToast(title, text) {
    const toast = this.toastCtrl.create({
      message: text,
      showCloseButton: true,
      closeButtonText: title,
      duration: 2000,
      position: "top"
    });
    toast.present();
  }

  toggleState() {
    let state = this.player.state == "online" ? "offline" : "online";
    this.refPlayers
      .child(this.myUid)
      .child("state")
      .set(state);
  }

  changeAvatar(email) {
    if (this.myProfile && email && this.myUid) {
      let randomAvatar =
        "https://api.adorable.io/avatars/100/" +
        this.getRandomString(3) +
        email;
      this.refPlayers
        .child(this.myUid)
        .child("photo")
        .set(randomAvatar);
    }
  }

  getRandomString(length) {
    return Math.random()
      .toString(36)
      .substring(length);
  }
}
