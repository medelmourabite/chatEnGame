import { SignUpPage } from "./../pages/sign-up/sign-up";
import { Component } from "@angular/core";
import { Platform, MenuController, ModalController } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { AuthService } from "../services/auth.service";
import { LoginPage } from "../pages/login/login";
// import * as firebase from "firebase";
import { ToastController } from "ionic-angular/components/toast/toast-controller";
import { timer } from "rxjs/observable/timer";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage: any;

  // Initialize Firebase
  // player: any;
  // refPlayers = firebase.database().ref("players/");

  showSplash = true;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public menuCtrl: MenuController,
    public auth: AuthService,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController
  ) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
      timer(10000).subscribe(() => (this.showSplash = false));
      // let splash = modalCtrl.create(SplashPage);
      //     splash.present();
    });

    this.auth.afAuth.authState.subscribe(
      user => {
        if (user) {
          // this.loadData(user.uid);
          this.rootPage = "TabsPage";
        } else {
          this.rootPage = LoginPage;
        }
      },
      () => {
        this.rootPage = LoginPage;
      }
    );
  }

  logout() {
    this.menuCtrl.close();
    this.auth.signOut();
  }

  login() {
    this.menuCtrl.close();
    this.auth.signOut();
    this.rootPage = LoginPage;
  }

  register() {
    this.menuCtrl.close();
    this.auth.signOut();
    this.rootPage = SignUpPage;
  }

  goToProfile() {
    this.rootPage = "TabsPage";
  }

  showToast(title, text) {
    const toast = this.toastCtrl.create({
      message: text,
      showCloseButton: true,
      closeButtonText: title,
      duration: 2000,
      position: title == "ready" ? "middle" : "top"
    });
    toast.present();
  }
}
