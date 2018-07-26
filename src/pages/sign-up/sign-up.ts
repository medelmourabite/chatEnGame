import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LoginPage } from "../login/login";
import { AuthService } from "../../services/auth.service";
import * as firebase from "firebase";

// @IonicPage()
@Component({
  selector: "page-sign-up",
  templateUrl: "sign-up.html"
})
export class SignUpPage {
  signupError: string;
  form: FormGroup;
  currentUser: Object;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = fb.group({
      name: ["", Validators.compose([Validators.required])],
      age: [
        "",
        Validators.compose([
          Validators.required,
          Validators.min(12),
          Validators.max(99)
        ])
      ],
      email: ["", Validators.compose([Validators.required, Validators.email])],
      password: [
        "",
        Validators.compose([Validators.minLength(6), Validators.required])
      ]
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SignUpPage");
  }

  signup() {
    let data = this.form.value;
    let credentials = {
      email: data.email,
      password: data.password
    };

    this.auth.signUp(credentials).then(user => {
      let player = {
        name: data.name,
        email: data.email,
        age: data.age,
        photo: "",
        points: 0,
        level: 1,
        new: {
          friends: true,
          profile: true,
          rooms: true,
          room: true
        }
      };
      let ref = firebase.database().ref("players/" + user.uid);
      ref.set(player);

      this.navCtrl.setRoot(LoginPage);
    }, error => (this.signupError = error.message));
  }
}
