import { WelcomePage } from "./../welcome/welcome";
import { TabsPage } from "./../tabs/tabs";
import { Component } from "@angular/core";
import {  NavController, NavParams } from "ionic-angular";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { SignUpPage } from "../sign-up/sign-up";
import * as firebase from "firebase";
import { ToastController } from "ionic-angular/components/toast/toast-controller";
 
// @IonicPage()
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  loginForm: FormGroup;
  loginError: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    formb: FormBuilder,
    private auth: AuthService,
    public toastCtrl: ToastController
  ) {
    this.loginForm = formb.group({
      email: ["", Validators.compose([Validators.required, Validators.email])],
      password: [
        "",
        Validators.compose([Validators.required, Validators.minLength(6)])
      ]
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad LoginPage");
  }

  login() {
    let data = this.loginForm.value;
    if (!data.email) {
      return;
    }

    let credentials = {
      email: data.email,
      password: data.password
    };

    this.auth
      .signInWithEmail(credentials)
      .then(
        () => this.navCtrl.setRoot(TabsPage),
        error => (this.loginError = error.message)
      );
  }

  loginWithGoogle() {
    // this.showToast("TRY", "login with gPlus");
    // var provider = new firebase.auth.GoogleAuthProvider();

    // firebase
    //   .auth()
    //   .signInWithRedirect(provider)
    //   .then(function() {
    //     console.log("REDIRECT");

    //     return firebase.auth().getRedirectResult();
    //   })
    //   .then(function(result) {
    //     // This gives you a Google Access Token.
    //     // You can use it to access the Google API.
    //     var token = result.credential.accessToken;
    //     // The signed-in user info.
    //     var user = result.user;
    //     // ...

    //     console.log("REDIRECT", user);

    //     // this.addTODb(user, this, function(parrent, firstTime) {
    //     //   if (firstTime) {
    //     //     parrent.navCtrl.setRoot(WelcomePage, {
    //     //       name: user.user.displayName
    //     //     });
    //     //   } else {
    //     //     parrent.navCtrl.setRoot(TabsPage);
    //     //   }
    //     // });
    //   })
    //   .catch(function(error) {
    //     // Handle Errors here.
    //     var errorCode = error.code;
    //     var errorMessage = error.message;
    //     console.log("REDIRECT", "ERROR " + error.message);
    //   });
    // this.googlePlus
    //   .login({})
    //   .then(user => {
    //     this.showToast("Logged", user.user.email);
    //     this.addTODb(user, this, function(parrent, firstTime) {
    //       if (firstTime) {
    //         parrent.navCtrl.setRoot(WelcomePage, { name: user.displayName });
    //       } else {
    //         parrent.navCtrl.setRoot(TabsPage);
    //       }
    //     });
    //   })
    //   .catch(err => {
    //     error => console.log("Login", "Error");
    //   });

    this.auth.signInWithGoogle().then(
      res => {
        this.addTODb(res, this, function(parrent, firstTime) {
          if (firstTime) {
            parrent.navCtrl.setRoot(WelcomePage, {
              name: res.user.displayName
            });
          } else {
            parrent.navCtrl.setRoot(TabsPage);
          }
        });
      },
      error => console.log("Login", "Error")
    );
  }

  addTODb(res, parrent, cb) {
    let user = res.user;
    firebase
      .database()
      .ref("players/" + user.uid)
      .on("value", function(snapshot) {
        if (
          snapshot.exists() &&
          snapshot.val().email &&
          snapshot.val().name &&
          snapshot.val().photo
        ) {
          cb(parrent, false);
        } else {
          let player = {
            name: user.displayName,
            email: user.email,
            age: 0,
            photo: user.photoURL,
            points: 0,
            level: 0
          };
          console.log(user, player);
          let ref = firebase.database().ref("players/" + user.uid);
          ref.set(player);
          cb(parrent, true);
        }
      });
  }

  signup() {
    this.navCtrl.push(SignUpPage);
  }

  takeAtour() {
    this.navCtrl.push(WelcomePage);
  }

  // loginWithFacebook() {
  //   // Login with permissions
  //   this.fb
  //     .login(["public_profile", "user_photos", "email", "user_birthday"])
  //     .then((res: FacebookLoginResponse) => {
  //       // The connection was successful
  //       if (res.status == "connected") {
  //         // Get user ID and Token
  //         var fb_id = res.authResponse.userID;
  //         var fb_token = res.authResponse.accessToken;

  //         // Get user infos from the API
  //         this.fb
  //           .api("/me?fields=id,name,email,picture,gender,birthday", [])
  //           .then(user => {
  //             console.log("FB", user);

  //             firebase
  //               .database()
  //               .ref("players/" + user.id)
  //               .on("value", function(snapshot) {
  //                 if (!snapshot.exists()) {

  //                   let player = {
  //                     name: user.name,
  //                     email: user.email,
  //                     age: 0,
  //                     photo: user.picture.data.url,
  //                     points: 0,
  //                     level: 0
  //                   };
  //                   let ref = firebase.database().ref("players/" + user.id);
  //                   ref.set(player);
  //                   // cb(parrent, true);
  //                 } else {
  //                   // cb(parrent, false);
  //                 }
  //               });
  //             // => Open user session and redirect to the next page
  //           });
  //       } else {
  //         console.log("An error occurred...");
  //       }
  //     })
  //     .catch(e => {
  //       console.log("Error logging into Facebook", e);
  //     });
  // }

  loginWithFacebook() {
    // var provider = new firebase.auth.FacebookAuthProvider();

    // firebase
    //   .auth()
    //   .signInWithRedirect(provider)
    //   .then(function() {
    //     console.log("REDIRECT");

    //     return firebase.auth().getRedirectResult();
    //   })
    //   .then(function(result) {
    //     // This gives you a Google Access Token.
    //     // You can use it to access the Google API.
    //     var token = result.credential.accessToken;
    //     // The signed-in user info.
    //     var user = result.user;
    //     // ...

    //     console.log("REDIRECT USER", user);

    //     // this.addTODb(user, this, function(parrent, firstTime) {
    //     //   if (firstTime) {
    //     //     parrent.navCtrl.setRoot(WelcomePage, {
    //     //       name: user.user.displayName
    //     //     });
    //     //   } else {
    //     //     parrent.navCtrl.setRoot(TabsPage);
    //     //   }
    //     // });
    //   })
    //   .catch(function(error) {
    //     // Handle Errors here.
    //     var errorCode = error.code;
    //     var errorMessage = error.message;
    //     console.log("REDIRECT", "ERROR " + error.message);
    //   });
    this.auth
      .signInWithFacebook()
      .then(result => {
        // var token = result.credential.accessToken; // The signed-in user info.
        var user = result.user;
        console.log("FB ", user.uid, user.displayName, user.email);

        this.addTODb(user, this, function(parrent, firstTime) {
          if (firstTime) {
            parrent.navCtrl.setRoot(WelcomePage, {
              name: user.displayName
            });
          } else {
            parrent.navCtrl.setRoot(TabsPage);
          }
        });
      })
      .catch(function(error) {
        //        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        console.log("ERROR", email, errorMessage);
      });
  }

  showToast(title, text) {
    const toast = this.toastCtrl.create({
      message: text,
      showCloseButton: true,
      closeButtonText: title,
      duration: 2000
    });
    toast.present();
  }
}
