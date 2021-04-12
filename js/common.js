const FUNC_ID_LOGIN = "1";
const FUNC_ID_MAIN = "2";
const FUNC_ID_CSTREGIST_SEARCH = "3";
const FUNC_ID_CSTREGIST_SEARCHRESULT = "4";
const FUNC_ID_CSTREGIST_INPUT = "5";
const FUNC_ID_CSTREGIST_CONFIRM = "6";
const FUNC_ID_CSTREGIST_COMPLETE = "7";
const FUNC_ID_APP_LIST = "8";
const FUNC_ID_APP_CONFIRM = "9";
const FUNC_ID_APP_COMPLETE = "10";

// 承認ステータス　1:承認待ち　2:差戻 3:承認完了
const APP_BEFAPPR = "1";
const APP_REMAND = "2";
const APP_APPROVED = "3";

//申請区分 1:顧客登録
const APPDIV_CUSTOMERREGIST = "1";

let headerTag =
  "<header><div><h1 class='title'>" +
  "<a class='display-4 systemtitle' href='./main.html'>顧客管理システム</a></h1></div>";

let c_appId = "200000";
let c_loginId = "";

$(function () {
  $("#header").append(headerTag);
  $("#footer").append(
    "<footer><p class='copyright'>Copyright © 2021 Falcs All Rights Reserved.</p></footer>"
  );

  const url = new URL(window.location.href);
  // ログイン画面以外の場合のみログインチェック
  if (String(url).indexOf("index") == -1) {
    logincheck()
      .then((login) => {
        c_loginId = login.login_id;
      })
      .catch((error) => {
        // tmpにログイン情報がない場合、または複数件ある場合
        // エラーメッセージ表示させる？
        delTmpData(FUNC_ID_LOGIN);
        window.location.href = "./index.html";
      });
  }
});

function formatDate() {
  const dt = new Date();
  let format = "YYYY/MM/DD";
  format = format.replace(/YYYY/, dt.getFullYear());
  format = format.replace(/MM/, ("00" + (dt.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/, ("00" + dt.getDate()).slice(-2));

  return format;
}

function getAppStatusName(appStatusCd) {
  // 承認ステータス　1:承認待ち　2:差戻 3:承認完了
  let appStatusName = ""
  switch (appStatusCd) {
    case APP_BEFAPPR:
      appStatusName = "承認待ち"
      break;
    case APP_REMAND:
      appStatusName = "差戻"
      break;
    case APP_APPROVED:
      appStatusName = "承認完了"
      break;
  }
  return appStatusName
}

function getAppDivName(appDivCd) {
  //申請区分 1:顧客登録
  let appDivName = ""
  switch (appDivCd) {
    case APP_BEFAPPR:
      appDivName = "顧客登録"
      break;
  }
  return appDivName
}
