import { Injectable } from "@angular/core";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
import AuthProvider = firebase.auth.AuthProvider;

@Injectable()
export class AuthService {
  private user: firebase.User;
  refUser: any;
  player: any;
  constructor(public afAuth: AngularFireAuth) {
    afAuth.authState.subscribe(user => {
      this.user = user;
      if (user) {
        this.refUser = firebase
          .database()
          .ref("players/" + user.uid)
          .child("state");
        firebase
          .database()
          .ref("players/" + user.uid)
          .on("value", s => {
            this.player = s.val();
          });
        this.updateState();
      }
    });
  }

  amOnline = firebase.database().ref(".info/connected");

  updateState() {
    this.amOnline.on("value", s => {
      if (s.val()) {
        this.refUser.onDisconnect().set("offline");
        this.refUser.set("online");
      }
    });
  }

  signInWithEmail(credentials) {
    console.log("Sign in with email");
    return this.afAuth.auth.signInWithEmailAndPassword(
      credentials.email,
      credentials.password
    );
  }

  signUp(credantials) {
    return this.afAuth.auth.createUserWithEmailAndPassword(
      credantials.email,
      credantials.password
    );
  }

  get authenticated(): boolean {
    return this.user !== null;
  }

  getUid() {
    return this.user && this.user.uid;
  }

  getEmail() {
    return this.player && this.player.email;
  }

  getName() {
    return this.player && this.player.name;
  }

  getPhoto() {
    return this.player && this.player.photo;
  }

  getLevel() {
    return this.player && this.player.level;
  }

  getPoints() {
    return this.player && this.player.points;
  }

  signOut(): Promise<void> {
    this.refUser.set("offline");
    return this.afAuth.auth.signOut();
  }

  signInWithGoogle() {
    console.log("Sign in with google");

    return this.oauthSignIn(new firebase.auth.GoogleAuthProvider());
  }

  signInWithFacebook() {
    console.log("Sign in with fb");
    return this.oauthSignIn(new firebase.auth.FacebookAuthProvider());
  }

  private oauthSignIn(provider: AuthProvider) {
    if (!(<any>window).cordova) {
      console.log("POPUP");
      return this.afAuth.auth.signInWithPopup(provider);
    } else {
      console.log("REDIRECT");
      return this.afAuth.auth.signInWithRedirect(provider).then(() => {
        console.log("SIGN IN WITH REDIRECT");
        return this.afAuth.auth
          .getRedirectResult()
          .then(result => {
            let user = result.user;
            this.user = user;
            console.log("REDIRECT", "SIGNED IN", user);
          })
          .catch(function(error) {
            console.log("REDIRECT", "FAILED", error.message);
          });
      });
    }
  }
}
