import { HintsPage } from "./../pages/hints/hints";
export const loadUser = (refPlayers, uid, callback) => {
  console.log(uid);

  refPlayers.child(uid).on("value", snapshot => {
    let user = {
      uid: uid,
      email: snapshot.val().email,
      name: snapshot.val().name,
      level: snapshot.val().level,
      points: snapshot.val().points,
      roomsIds: this.snapShotToArray(snapshot.val().roomsIds),
      friendsUids: this.snapShotToArray(snapshot.val().friendsUids)
    };
    callback(user);
  });
};

export const snapShotToArray = snapShot => {
  let arr = [];
  snapShot.forEach(element => {
    let item = element.val();
    item.key = element.key;
    arr.push(item);
  });
  return arr;
};

export const snapShotToArray2 = s => {
  let arr = [];
  s.forEach(element => {
    let item = element.val();
    arr.push(item);
  });
  return arr;
};

export const showHints = function(
  mdlCtrl,
  uid,
  type,
  title,
  message,
  top,
  bottom,
  left,
  right
) {
  let mdl = mdlCtrl.create(HintsPage, {
    uid,
    type,
    title,
    message,
    top,
    bottom,
    left,
    right
  });
  mdl.present();
};
