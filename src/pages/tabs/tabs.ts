import { NavController } from "ionic-angular";
import { RoomsPage } from "./../rooms/rooms";
import { FriendsPage } from "./../friends/friends";
import { Component } from "@angular/core";
import { ProfilePage } from "../profile/profile";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
  
  selector: "page-tabs",
  templateUrl: "tabs.html" 
})
export class TabsPage {
  profile = ProfilePage;
  friends = FriendsPage;
  rooms = RoomsPage;

  constructor(public navCtrl: NavController) {
    console.log("ionViewDidLoad Tabs");
  }
}
