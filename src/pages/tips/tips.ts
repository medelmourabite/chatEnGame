import { ViewController } from "ionic-angular/navigation/view-controller";
import { Component } from "@angular/core";
import { NavParams } from "ionic-angular";

@Component({
  selector: "page-tips",
  templateUrl: "tips.html"
})
export class TipsPage {
  tips = {
    spellcheck: [
      "Be aware! For every error you commit you lose XP points",
      "For every correct words you writes you win XP points",
      "The longer your sentences the better"
    ],
    quiz: [
      "In this mini game the chat bot will be your teacher",
      "Get ready for the questions",
      "The fastest player who answers win the prize"
    ],
    story: [
      "In this mini game you play as a story teller",
      "A collective improv story is told by many story tellers",
      "A player will be selected randomly to write his part",
      "Every story teller has a limited time to write while others will wait",
      "from time to time the chat bot will suggest randoms words",
      "Chouse a word and add it to your phrase to win more XP points"
    ],
    startWithEnd: [
      "This game is simple",
      "You have only one constraint",
      "just start with the last word or leter"
    ]
  };

  gameTips = [];

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    console.log(navParams.data.game);

    this.gameTips = navParams.data.game ? this.tips[navParams.data.game] : [];
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
