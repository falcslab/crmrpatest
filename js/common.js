const FUNC_ID_LOGIN = "1";
const FUNC_ID_MAIN = "2";
const FUNC_ID_CSTREGIST_SEARCH = "3";
const FUNC_ID_CSTREGIST_SEARCHRESULT = "4";
const FUNC_ID_CSTREGIST_INPUT = "5";
const FUNC_ID_CSTREGIST_CONFIRM = "6";
const FUNC_ID_CSTREGIST_COMPLETE = "7";
const FUNC_ID_APP_SEARCH = "8";
const FUNC_ID_APP_CONFIRM = "9";
const FUNC_ID_APP_COMPLETE = "10";

// 申請ステータス　1:承認待ち　2:差戻 3:承認完了
const APP_BEFAPPR = "1";
const APP_REMAND = "2";
const APP_APPROVED = "3";

//申請区分 1:顧客登録
const APPDIV_CUSTOMERREGIST = "1";

let headerTag =
  "<header><div><h1 class='title'>" +
  "<a class='display-4 systemtitle' href='./main.html'>顧客管理システム</a></h1></div>";
let errorTag = "<div class='alert alert-danger alert-dismissible fade show' role='alert'>{$errorMsg}" +
  "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button></div>"
let warnTag = "<div class='alert alert-warning alert-dismissible fade show' role='alert'>{$warnMsg}" +
  "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button></div>"
let c_appId = "200000";
let c_cstId = "100000";
let c_loginId = "";
let c_loginNm = "";

$(function () {
  $("#header").append(headerTag);
  $("#footer").append(
    "<footer><p class='copyright'>Copyright © 2021 Falcs All Rights Reserved.</p></footer>"
  );

  const url = new URL(window.location.href);
  // ログイン画面以外の場合のみログインチェック;
  if (String(url).indexOf("index") == -1) {
    logincheck()
      .then((login) => {
        c_loginId = login.login_id;
        c_loginNm = login.login_name
      })
      .catch((error) => {
        // tmpにログイン情報がない場合、または複数件ある場合
        // エラーメッセージ表示させる？
        delTmpData(FUNC_ID_LOGIN);
        // window.location.href = "./index.html";
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
  // 申請ステータス　1:承認待ち　2:差戻 3:承認完了
  let appStatusName = "";
  switch (appStatusCd) {
    case APP_BEFAPPR:
      appStatusName = "承認待ち";
      break;
    case APP_REMAND:
      appStatusName = "差戻";
      break;
    case APP_APPROVED:
      appStatusName = "承認完了";
      break;
  }
  return appStatusName;
}

function getAppDivName(appDivCd) {
  //申請区分 1:顧客登録
  let appDivName = "";
  switch (appDivCd) {
    case APP_BEFAPPR:
      appDivName = "顧客登録";
      break;
  }
  return appDivName;
}

// ===============================================================
// 顧客入力 パラメータ入力
// ===============================================================
function setCstParam(funcId, cstInfo) {
  $("#cst_id").val(cstInfo.cst_id);
  $("#cst_name_lst").val(cstInfo.cst_name_lst);
  $("#cst_name_fst").val(cstInfo.cst_name_fst);
  $("#cst_name_kana_lst").val(cstInfo.cst_name_kana_lst);
  $("#cst_name_kana_fst").val(cstInfo.cst_name_kana_fst);
  if (funcId == FUNC_ID_CSTREGIST_CONFIRM || funcId == FUNC_ID_APP_CONFIRM) {
    if (cstInfo.sex == "1") {
      $("#sex").val("男");
    } else {
      $("#sex").val("女");
    }
  } else {
    if (cstInfo.sex == "1") {
      $("input:radio[name='radio_sex']").val(["1"]);
    } else {
      $("input:radio[name='radio_sex']").val(["2"]);
    }
  }
  $("#birthday").val(cstInfo.birthday);
  $("#home_tel").val(cstInfo.home_tel);
  $("#mbl_tel").val(cstInfo.mbl_tel);
  $("#mailaddr").val(cstInfo.mailaddr);
  $("#post_cd").val(cstInfo.post_cd);
  if (funcId == FUNC_ID_CSTREGIST_CONFIRM || funcId == FUNC_ID_APP_CONFIRM) {
    getPrefName(cstInfo.pref_cd).then((pref) => {
      $("#pref_cd").val(pref.pref_name);
    })
  } else {
    $("#pref_list>option[value='" + cstInfo.pref_cd + "']").prop(
      "selected",
      true
    );
  }
  $("#addr1").val(cstInfo.addr1);
  $("#addr2").val(cstInfo.addr2);
  $("#wkplace_name").val(cstInfo.wkplace_name);
  $("#wkplace_tel").val(cstInfo.wkplace_tel);
}

// ===============================================================
// エラー表示
// ===============================================================
function setErrorMsg(errorMsg) {
  errorTag = errorTag.replace("{$errorMsg}", errorMsg);
  $("div.alert").remove();
  $("#errorinfo").append(errorTag);

  let pos = $("body").get(0).offsetTop;
  $("body").animate({ scrollTop: pos }, 'fast');
}

// ===============================================================
// 通知メッセージ表示
// ===============================================================
function setWarnMsg(warnMsg) {
  warnTag = warnTag.replace("{$warnMsg}", warnMsg);
  $("div.alert").remove();
  $("#errorinfo").append(warnTag);

  let pos = $("body").get(0).offsetTop;
  $("body").animate({ scrollTop: pos }, 'fast');
}

// ===============================================================
// 顧客入力 テストデータ入力
// ===============================================================
function setCstTestData() {
  $("#cst_name_lst").val("山田");
  $("#cst_name_fst").val("太郎");
  $("#cst_name_kana_lst").val("ヤマダ");
  $("#cst_name_kana_fst").val("タロウ");
  $("input:radio[name='radio_sex']").val(["1"]);
  $("#birthday").val("1999/01/01");
  $("#home_tel").val("03-1111-2222");
  $("#mbl_tel").val("080-2222-3333");
  $("#mailaddr").val("testyamada@test.jp");
  $("#post_cd").val("111-2222");
  $("#pref_list>option[value='13']").prop("selected", true);
  $("#addr1").val("テスト区テスト");
  $("#addr2").val("テストマンション501号");
  $("#wkplace_name").val("テスト会社");
  $("#wkplace_tel").val("03-9876-5432");
}
