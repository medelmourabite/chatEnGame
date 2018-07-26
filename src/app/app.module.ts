import { HintsPage } from "./../pages/hints/hints";
import { TipsPage } from "./../pages/tips/tips";
import { WelcomePage } from "./../pages/welcome/welcome";
import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import { NgxErrorsModule } from "@ultimate/ngxerrors";

import { AngularFireModule } from "angularfire2";
import { AngularFireAuth } from "angularfire2/auth";
import { firebaseConfig } from "../config";

import { AuthService } from "../services/auth.service";

import { SocialSharing } from "@ionic-native/social-sharing";

import { MyApp } from "./app.component";
import { SignUpPage } from "../pages/sign-up/sign-up";
import { LoginPage } from "../pages/login/login";
import { RoomPage } from "./../pages/room/room";
import { AddRoomPage } from "./../pages/add-room/add-room";
import { RoomsPage } from "../pages/rooms/rooms";
import { SelectGamePage } from "./../pages/select-game/select-game";
import { InvitationsPage } from "../pages/invitations/invitations";
import { ActivePlayersPage } from "./../pages/active-players/active-players";
import { FriendsPage } from "./../pages/friends/friends";
import { ProfilePage } from "./../pages/profile/profile";

import { TooltipsModule } from "ionic-tooltips";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
  declarations: [
    MyApp,
    // TabsPage,
    LoginPage,
    SignUpPage,
    RoomPage,
    AddRoomPage,
    ProfilePage,
    FriendsPage,
    RoomsPage,
    SelectGamePage,
    InvitationsPage,
    ActivePlayersPage,
    WelcomePage,
    TipsPage,
    HintsPage
  ],
  imports: [
    BrowserModule,
    // IonicModule.forRoot(MyApp),
    IonicModule.forRoot(MyApp, { scrollPadding: false }),
    NgxErrorsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    TooltipsModule,
    BrowserAnimationsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignUpPage,
    AddRoomPage,
    RoomPage,
    ProfilePage,
    FriendsPage,
    RoomsPage,
    // TabsPage,
    SelectGamePage,
    InvitationsPage,
    ActivePlayersPage,
    WelcomePage,
    TipsPage,
    HintsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AuthService,
    AngularFireAuth,
    SocialSharing
  ]
})
export class AppModule {}
