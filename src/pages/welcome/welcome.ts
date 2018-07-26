import { LoginPage } from "./../login/login";
import { Validators } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { AuthService } from "./../../services/auth.service";
import { FormBuilder } from "@angular/forms";
import { TabsPage } from "./../tabs/tabs";
import { Component, ViewChild } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { Slides } from "ionic-angular/components/slides/slides";
import * as firebase from "firebase";

// @IonicPage()
@Component({
  selector: "page-welcome",
  templateUrl: "welcome.html"
})
export class WelcomePage {
  @ViewChild("slider") slider: Slides;
  slideIndex = 0;
  signupError: string;
  form: FormGroup;
  currentUser: Object;

  randomAvatar;

  slides = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    fb: FormBuilder,
    private auth: AuthService
  ) {
    this.randomAvatar = this.form = fb.group({
      name: ["", Validators.compose([Validators.required])],
      // age: [
      //   "",
      //   Validators.compose([
      //     Validators.required,
      //     Validators.min(12),
      //     Validators.max(99)
      //   ])
      // ],
      email: ["", Validators.compose([Validators.required, Validators.email])],
      password: [
        "",
        Validators.compose([Validators.minLength(6), Validators.required])
      ]
    });

    let name = navParams.data.name ? navParams.data.name : "";
    this.slides = [
      {
        title: "Welcome " + name,
        imageUrl: "assets/imgs/1.png",
        description: `This app will help you practise your english<br>
                      it offers you a unique learning experience,<br>
                      expand your vocabulary<br>
                      and talk like a native speaker`,
        img: "assets/imgs/avatar0.jpg"
      },
      {
        title: "Chat and learn",
        imageUrl: "assets/imgs/2.png",
        description: `Because the most effective way to learn is discussing<br>
                      The learning will take place in a chatroom<br>
                      And There is 4 mini games to entertain you<br>
                      Chat with other users<br>
                      Win XP points, Level up<br>
                      And Enjoy learning`,
        img: "assets/imgs/games.PNG"
      },
      {
        title: "Lets start",
        imageUrl: "assets/imgs/3.png",
        description: `The difficulty of a chat-rooms will be according to your level<br>
                      And you need to level up to see more chatrooms`,
        img: "assets/imgs/rooms.PNG"
      }
    ];
  }

  onSlideChanged() {
    this.slideIndex = this.slider.getActiveIndex();
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
        photo: "https://api.adorable.io/avatars/100/" + data.email,
        points: 0,
        level: 0,
        new: {
          friends: true,
          profile: true,
          rooms: true,
          room: true
        }
      };
      let ref = firebase.database().ref("players/" + user.uid);
      ref.set(player).then(() => {
        this.auth
          .signInWithEmail(credentials)
          .then(() => {
            this.navCtrl.setRoot(TabsPage);
          })
          .catch(function() {
            this.navCtrl.setRoot(LoginPage);
          });
      });
    }, error => (this.signupError = error.message));
  }

  goToApp() {
    this.slideIndex = this.slides.length;
    this.slider.slideTo(this.slideIndex);
  }
}
