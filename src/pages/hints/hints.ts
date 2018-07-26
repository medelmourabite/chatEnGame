import { ViewController } from "ionic-angular/navigation/view-controller";
import { Component } from "@angular/core";
import {  NavParams } from "ionic-angular";
import * as firebase from "firebase";

// @IonicPage()
@Component({
  selector: "page-hints",
  templateUrl: "hints.html"
})
export class HintsPage {
  hint: any;
  position = {};

  refPlayers = firebase.database().ref("players/");

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.hint = navParams.data;

    if (this.hint.top) {
      this.position["top"] = this.hint.top;
    }
    if (this.hint.bottom) {
      this.position["bottom"] = this.hint.bottom;
    }
    if (this.hint.left) {
      this.position["left"] = this.hint.left;
    }
    if (this.hint.right) {
      this.position["right"] = this.hint.right;
    }
  }

  close() {
    this.dontShowAgain();
    this.viewCtrl.dismiss();
  }

  dontShowAgain() {
    this.refPlayers.child(this.hint.uid + "/new/" + this.hint.type).set(null);
  }
}
