const FUNC_ID_ALL = "0";
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
const FUNC_ID_CSTLIST_SEARCH = "11";
const FUNC_ID_CSTLIST_SEARCHRESULT = "12";

// 申請ステータス　1:承認待ち　2:差戻 3:承認完了
const APP_BEFAPPR = "1";
const APP_REMAND = "2";
const APP_APPROVED = "3";

// 申請区分 1:顧客登録
const APPDIV_CUSTOMERREGIST = "1";

// エラーメッセージ
const ERRORMSG_NAME_LST_REQUIRED = "氏名（姓）の入力は必須です。";
const ERRORMSG_NAME_FST_REQUIRED = "氏名（名）の入力は必須です。";
const ERRORMSG_KANA_LST_REQUIRED = "氏名カナ（姓）の入力は必須です。";
const ERRORMSG_KANA_FST_REQUIRED = "氏名カナ（名）の入力は必須です。";
const ERRORMSG_BIRTHDAY_REQUIRED = "生年月日の入力は必須です。";
const ERRORMSG_TEL_REQUIRED = "自宅もしくは携帯電話番号の入力は必須です。";
const ERRORMSG_MAILADDR_REQUIRED = "メールアドレスの入力は必須です。";
const ERRORMSG_POST_CD_REQUIRED = "郵便番号の入力は必須です。";
const ERRORMSG_ADDR1_REQUIRED = "市区町村番地の入力は必須です。";

const ERRORMSG_KANA_LST_FORMAT =
  "氏名カナ（姓）のフォーマットが正しくありません。";
const ERRORMSG_KANA_FST_FORMAT =
  "氏名カナ（名）のフォーマットが正しくありません。";
const ERRORMSG_BIRTHDAY_FORMAT = "生年月日のフォーマットが正しくありません。";
const ERRORMSG_HOME_TEL_FORMAT =
  "自宅電話番号のフォーマットが正しくありません。";
const ERRORMSG_MBL_TEL_FORMAT =
  "携帯電話番号のフォーマットが正しくありません。";
const ERRORMSG_MAILADDR_FORMAT =
  "メールアドレスのフォーマットが正しくありません。";
const ERRORMSG_POST_CD_FORMAT = "郵便番号のフォーマットが正しくありません。";
const ERRORMSG_WKPLACE_TEL_FORMAT =
  "勤務先電話番号のフォーマットが正しくありません。";
const ERRORMSG_CST_ID_FORMAT = "顧客番号のフォーマットが正しくありません。";
const ERRORMSG_APP_ID_FORMAT = "申請番号のフォーマットが正しくありません。";

const ERRORMSG_SEARCH_NO_DATA = "該当データが0件でした。";
const INFOMSG_SEARCH_DATA_COUNT = "該当データが{$count}件ヒットしました。";

const headerTag =
  "<header class='bd-header bg-info py-3 d-flex align-items-stretch border-bottom border-info'>" +
  "<div class='container-fluid d-flex align-items-center'><h1 class='d-flex align-items-center fs-4 text-white mb-0'>" +
  "<div class='headertitle display-6'><a class='headertitle' href='./index.html'>顧客管理システム</a></h1>{$loginInfoTag}</div></header>";
const loginUserTag = "<div class='logininfo'>{$loginName}</div>";
const errorTag =
  "<div class='alert alert-danger alert-dismissible fade show' role='alert'>{$errorMsg}" +
  "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button></div>";
const warnTag =
  "<div class='alert alert-warning alert-dismissible fade show' role='alert'>{$warnMsg}" +
  "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button></div>";
const infoTag =
  "<div class='alert alert-info alert-dismissible fade show' role='alert'>{$infoMsg}" +
  "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button></div>";
let c_appId = "200000";
let c_cstId = "100000";
let c_loginId = "";
let c_loginNm = "";

$(function () {
  // DB初期化リンクを非表示
  let tmpHeaderTag = headerTag;
  let tmploginUserTag = loginUserTag;

  const url = new URL(window.location.href);
  loginCheck()
    .then((login) => {
      c_loginId = login.login_id;
      c_loginNm = login.login_name;
    })
    .then(() => {
      tmploginUserTag = tmploginUserTag.replace(
        "{$loginName}",
        "ログイン：" + c_loginNm
      );
      if (c_loginNm !== "") {
        tmpHeaderTag = tmpHeaderTag.replace("{$loginInfoTag}", tmploginUserTag);
      } else {
        tmpHeaderTag = tmpHeaderTag.replace("{$loginInfoTag}", "");
      }
      $("#header").append(tmpHeaderTag);
      $("#footer").append(
        "<footer><p class='copyright'>Copyright © 2021 Falcs All Rights Reserved.</p></footer>"
      );
    })
    .catch((error) => {
      delTmpData(FUNC_ID_LOGIN);

      let url = window.location.href;
      // アクセス先がログイン画面か判定（直アクセス防止）
      if (url.indexOf("index.html") == -1) {
        delTmpData(FUNC_ID_LOGIN);
        // ログイン画面へ
        window.location.href = "./index.html";
      } else {
        // ログイン画面の場合
        tmploginUserTag = tmploginUserTag.replace("{$loginName}", "");
        tmpHeaderTag = tmpHeaderTag.replace("{$loginInfoTag}", tmploginUserTag);
        $("#header").append(tmpHeaderTag);
        $("#footer").append(
          "<footer><p class='copyright'>Copyright © 2021 Falcs All Rights Reserved.</p></footer>"
        );
      }
    });
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
  if (funcId === FUNC_ID_CSTREGIST_CONFIRM || funcId === FUNC_ID_APP_CONFIRM) {
    if (cstInfo.sex === "1") {
      $("#sex").val("男");
    } else {
      $("#sex").val("女");
    }
  } else {
    if (cstInfo.sex === "1") {
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
  if (funcId === FUNC_ID_CSTREGIST_CONFIRM || funcId === FUNC_ID_APP_CONFIRM) {
    getPrefName(cstInfo.pref_cd).then((pref) => {
      $("#pref_cd").val(pref.pref_name);
    });
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

// ===============================================================
// エラーメッセージ表示
// ===============================================================
function setErrorMsg(errorMsg) {
  let tmpErrorTag = errorTag;
  tmpErrorTag = tmpErrorTag.replace("{$errorMsg}", errorMsg);

  $("#info").append(tmpErrorTag);

  let pos = $("body").get(0).offsetTop;
  $("body").animate({ scrollTop: pos }, "fast");
}

// ===============================================================
// 警告メッセージ表示
// ===============================================================
function setWarnMsg(warnMsg) {
  let tmpWarnTag = warnTag;
  tmpWarnTag = tmpWarnTag.replace("{$warnMsg}", warnMsg);

  $("#info").append(tmpWarnTag);

  let pos = $("body").get(0).offsetTop;
  $("body").animate({ scrollTop: pos }, "fast");
}

// ===============================================================
// 通知メッセージ表示
// ===============================================================
function setInfoMsg(infoMsg) {
  let tmpInfoTag = infoTag;
  tmpInfoTag = tmpInfoTag.replace("{$infoMsg}", infoMsg);

  $("#info").append(tmpInfoTag);

  let pos = $("body").get(0).offsetTop;
  $("body").animate({ scrollTop: pos }, "fast");
}

// ===============================================================
// バリデーションチェック用
// ===============================================================
// カナチェック
function checkKana(prm) {
  let kanaptn = /^[ァ-ヶー　]+$/;
  let kanares = prm.match(kanaptn);
  let res = false;
  if (kanares !== null) {
    res = true;
  }
  return res;
}

// 日付チェック
function checkDate(prm) {
  let dt = new Date(prm);
  let res = false;
  if (dt.toString() !== "Invalid Date") {
    res = true;
  }
  return res;
}

// 自宅番号チェック
function checkTel(prm) {
  let telptn = /^\d{1,4}-\d{4}$|^\d{2,5}-\d{1,4}-\d{4}$/;
  let telres = prm.match(telptn);

  let res = false;
  if (telres !== null) {
    res = true;
  }
  return res;
}

// 携帯電話番号チェック
function checkMblTel(prm) {
  let telptn = /^\d{3}-\d{4}-\d{4}$/;
  let telres = prm.match(telptn);

  let res = false;
  if (telres !== null) {
    res = true;
  }
  return res;
}

// メールアドレスチェック
function checkMail(prm) {
  let mailptn =
    /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/;
  let mailres = prm.match(mailptn);

  let res = false;
  if (mailres !== null) {
    res = true;
  }
  return res;
}

// 顧客番号チェック
function checkCstId(prm) {
  let numptn = /^[1-9]{1}[0-9]+$/;
  let numres = prm.match(numptn);
  let res = false;
  if (numres !== null) {
    res = true;
  }
  return res;
}

// 申請番号チェック
function checkAppId(prm) {
  let numptn = /^[1-9]{1}[0-9]+$/;
  let numres = prm.match(numptn);
  let res = false;
  if (numres !== null) {
    res = true;
  }
  return res;
}

// 郵便番号チェック
function checkPostCd(prm) {
  // ハイフンをいったん除外
  let tmpprm = prm.replace("-", "");

  let numptn = /^[0-9]+(\.[0-9]+)?$/;
  let numres = tmpprm.match(numptn);

  let lenchkres = tmpprm.length === 7;

  let postres = false;
  let postptn = /^\d{3}-\d{4}$/g;
  postres = prm.match(postptn);

  let res = false;
  if (numres !== null && lenchkres === true && postres !== null) {
    res = true;
  }
  return res;
}

function addMsg(errorMsg, addMsg) {
  if (errorMsg !== "") {
    errorMsg = errorMsg + "<br/>" + addMsg;
  } else {
    errorMsg = errorMsg + addMsg;
  }
  return errorMsg;
}
