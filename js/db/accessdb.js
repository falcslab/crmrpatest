const db = new Dexie("cmsRPATest");
const cstListTag =
  "<tr><th>{$no}</th><td><a href='./cstregist_input.html?cstId={$cstId}' name='cstIdlink'>{$cstId}</button></td><td>{$cstNameLst}</td><td>{$cstNameFst}</td>" +
  "<td>{$cstNameKanaLst}</td><td>{$cstNameKanaFst}</td><td>{$birthDay}</td>" +
  "<td>{$homeTel}</td><td>{$mblTel}</td></tr>";
const appTableTag = "<table class='table table-striped appList'><thead><tr><th>#</th><th>申請ID</th><th>承認区分</th><th>申請ステータス</th>" +
  "<th>申請ユーザー</th><th>申請日</th></tr></thead><tbody></tbody></table>"
const appListTag = "<tr><th>{$no}</th><td><a href='./appaprv_confirm.html?appId={$appId}' name='appIdlink'>{$appId}</button></td><td>{$aprvDivName}</td>" +
  "<td>{$appStatusName}</td><td>{$appUserName}</td><td>{$appDate}</td>";
const prefTag =
  "<option id='prefcd_{$prefCd}' value={$prefCd}>{$prefName}</option>";

function initdb() {
  db.version(1).stores({
    user: "&login_id, login_pw",
    pref: "&pref_cd",
    customer:
      "&cst_id, cst_name_fst, cst_name_lst, cst_name_kana_fst, cst_name_kana_lst, birthday, home_tel, mbl_tel",
    app: "&app_id",
    tmp: "++id, func_id, cst_id, login_id",
  });
}

function bulkputdb() {
  db.user.bulkPut(m_user).catch((error) => {
    console.error(error);
  });

  db.pref.bulkPut(m_pref).catch((error) => {
    console.error(error);
  });

  db.customer.bulkPut(m_customer).catch((error) => {
    console.error(error);
  });
}

// ===============================================================
// userIdに紐つくユーザー情報を取得
// ===============================================================
async function getUserData(userId) {
  return await db.user.get({ login_id: userId })
    .catch((error) => {
      throw new Error("該当ユーザーなし");
    })
}

// ===============================================================
// ログイン実施
// ===============================================================
async function login(loginid, loginpw) {
  const loginuser = await db.user
    .get({ login_id: loginid, login_pw: loginpw })
    .catch(() => {
      throw new Error("該当ユーザーなし");
    });
  db.tmp
    .add({
      func_id: FUNC_ID_LOGIN,
      login_id: loginuser.login_id,
      login_name: loginuser.login_name,
    })
    .catch((error) => {
      // tmpに複数レコードログイン情報がある場合はログインエラー
      throw new Error("ログインエラー");
    });
}

// ===============================================================
// ログインデータがtmpテーブルに存在するかチェック
// ===============================================================
async function logincheck() {
  const loginInfo = await db.tmp
    .get({
      func_id: FUNC_ID_LOGIN,
    })
    .catch(() => {
      // tmpにログイン情報がない場合はログインエラー
      throw new Error("ログインエラー");
    });

  return loginInfo;
}

// ===============================================================
// func_cdに紐つくtmpテーブルのデータを削除
// ===============================================================
async function delTmpData(funcId) {
  await db.tmp
    .where({
      func_id: funcId,
    })
    .delete()
    .catch((error) => {
      console.error(error);
    });
}

// ===============================================================
// 名寄せ検索を実施してtmpテーブルに一時保存
// ===============================================================
async function cstSearch(
  cstNameFst,
  cstNameLst,
  cstNameKanaFst,
  cstNameKanaLst,
  birthDay,
  homeTel,
  mblTel
) {
  let searchCol = { cst_name_fst: cstNameFst, cst_name_lst: cstNameLst };

  if (cstNameKanaFst != "") {
    searchCol.cst_name_kana_fst = cstNameKanaFst;
  }
  if (cstNameKanaLst != "") {
    searchCol.cst_name_kana_lst = cstNameKanaLst;
  }
  if (birthDay != "") {
    searchCol.birthday = birthDay;
  }
  if (homeTel != "") {
    searchCol.home_tel = homeTel;
  }
  if (mblTel != "") {
    searchCol.mbl_tel = mblTel;
  }

  let result = [];
  await db.customer
    .where(searchCol)
    .each((cst) => {
      result.push(cst);
    })
    .catch((error) => {
      console.error("検索結果0件");
    });

  // 検索結果画面に紐付くtmpデータを削除
  await db.tmp
    .where({ func_id: FUNC_ID_CSTREGIST_SEARCHRESULT })
    .delete()
    .catch((error) => {
      console.error(error);
    });

  if (result.length != 0) {
    for (let res of result) {
      // 検索結果画面のIDをセット
      res.func_id = FUNC_ID_CSTREGIST_SEARCHRESULT;
      await db.tmp.put(res).catch((error) => {
        console.error(error);
      });
    }
  } else {
    throw new Error("検索エラー");
  }
}

// ===============================================================
// 名寄せ検索結果をtmpテーブルから取得して画面に表示
// ===============================================================
async function getCstSearchResult() {
  let tmpArr = [];

  await db.tmp
    .where("func_id")
    .equals(FUNC_ID_CSTREGIST_SEARCHRESULT)
    .each((tmp) => {
      tmpArr.push(tmp);
    });

  if (tmpArr.length == 0) {
    throw new Error("検索結果0件");
  }

  // 画面表示用にパラメータ変換
  let i = 0;
  for (let tm of tmpArr) {
    // パラメータ置換
    let tmpTag = cstListTag;
    tmpTag = tmpTag.replace("{$no}", i + 1);
    tmpTag = tmpTag.replaceAll("{$cstId}", tm.cst_id);
    tmpTag = tmpTag.replace("{$cstNameFst}", tm.cst_name_fst);
    tmpTag = tmpTag.replace("{$cstNameLst}", tm.cst_name_lst);
    tmpTag = tmpTag.replace("{$cstNameKanaFst}", tm.cst_name_kana_fst);
    tmpTag = tmpTag.replace("{$cstNameKanaLst}", tm.cst_name_kana_lst);
    tmpTag = tmpTag.replace("{$birthDay}", tm.birthday);
    tmpTag = tmpTag.replace("{$homeTel}", tm.home_tel);
    tmpTag = tmpTag.replace("{$mblTel}", tm.mbl_tel);

    $("tbody").append(tmpTag);
    i++;
  }
}

// ===============================================================
// 都道府県リストを取得して画面のプルダウンにセット
// ===============================================================
async function getPrefList() {
  let prefListTag = "";
  const pref = await db.pref.toArray();
  for (let pf of pref) {
    let tmpSelectPrefTag = prefTag;
    tmpSelectPrefTag = tmpSelectPrefTag.replaceAll("{$prefCd}", pf.pref_cd);
    tmpSelectPrefTag = tmpSelectPrefTag.replace("{$prefName}", pf.pref_name);
    prefListTag = prefListTag + tmpSelectPrefTag;
  }
  $("#pref_list").append(prefListTag);
}

async function getCstInfo(cstId) {
  const cstInfo = await db.customer.get({ cst_id: cstId });
  if (cstInfo == null) {
    throw new Error("該当顧客情報なし");
  }
  // パラメータ入力
  setCstParam(cstInfo);
}

// ===============================================================
// 申請情報（顧客データ）を顧客マスタに登録
// 申請情報確認画面⇒承認で実施
// ===============================================================
async function setCstInfo(cstId) {
  const tmpAppInfo = await db.tmp
    .get({ func_id: FUNC_ID_APP_CONFIRM })
    .catch((error) => {
      throw new Error("該当申請情報なし");
    });

  // 顧客マスタに更新 or 登録
  if (tmpAppInfo.cst_id == "") {
    cstId = await getNewCstId()
  } else {
    cstId = tmpAppInfo.cst_id
  }

  await db.customer
    .put({
      cst_id: cstId,
      cst_name_lst: tmpAppInfo.cst_name_lst,
      cst_name_fst: tmpAppInfo.cst_name_fst,
      cst_name_kana_lst: tmpAppInfo.cst_name_kana_lst,
      cst_name_kana_fst: tmpAppInfo.cst_name_kana_fst,
      sex: tmpAppInfo.sex,
      birthday: tmpAppInfo.birthday,
      home_tel: tmpAppInfo.home_tel,
      mbl_tel: tmpAppInfo.mbl_tel,
      mailaddr: tmpAppInfo.mailaddr,
      post_cd: tmpAppInfo.post_cd,
      pref_cd: tmpAppInfo.pref_cd,
      addr1: tmpAppInfo.addr1,
      addr2: tmpAppInfo.addr2,
      wkplace_name: tmpAppInfo.wkplace_name,
      wkplace_tel: tmpAppInfo.wkplace_tel,
    })
    .catch((error) => {
      throw new Error("顧客マスタ登録失敗");
    });
}

// ===============================================================
// 申請情報を画面にインプット
// ===============================================================
async function getAppInfo(appId) {
  const appInfo = await db.app.get({ app_id: appId });
  if (appInfo == null) {
    throw new Error("該当申請情報なし");
  }
  // パラメータ入力
  setCstParam(appInfo);
}

// ===============================================================
// 顧客入力完了
// ===============================================================
async function setAppInfo() {
  // 申請テーブルに登録
  const tmpCstInfo = await db.tmp
    .get({ func_id: FUNC_ID_CSTREGIST_CONFIRM })
    .catch((error) => {
      throw new Error("該当顧客入力情報なし");
    });

  // 申請テーブルからapp_idのMax値を取得
  let maxAppId = c_appId;
  await db.app
    .orderBy("app_id")
    .last()
    .then((app) => {
      maxAppId = app.app_id;
    })
    .catch((error) => {
      // 何もしない
    });

  // 申請テーブル登録
  await db.app
    .put({
      app_id: String(Number(maxAppId) + 1),
      cst_id: tmpCstInfo.cst_id,
      cst_name_lst: $("#cst_name_lst").val(),
      cst_name_fst: $("#cst_name_fst").val(),
      cst_name_kana_lst: $("#cst_name_kana_lst").val(),
      cst_name_kana_fst: $("#cst_name_kana_fst").val(),
      sex: $("input:radio[name='radio_sex']:checked").val(),
      birthday: $("#birthday").val(),
      home_tel: $("#home_tel").val(),
      mbl_tel: $("#mbl_tel").val(),
      mailaddr: $("#mailaddr").val(),
      post_cd: $("#post_cd").val(),
      pref_cd: $("#pref_list>option:selected").val(),
      addr1: $("#addr1").val(),
      addr2: $("#addr2").val(),
      wkplace_name: $("#wkplace_name").val(),
      wkplace_tel: $("#wkplace_tel").val(),
      app_status: APP_BEFAPPR,
      app_date: formatDate(),
      app_user_id: c_loginId,
      aprv_div: APPDIV_CUSTOMERREGIST,
    })
    .catch((error) => {
      throw new Error("顧客情報更新失敗");
    });

  // 顧客入力確認画面用の一時保存データを削除
  delTmpData(FUNC_ID_CSTREGIST_CONFIRM);
  // 名寄せ検索結果画面用の一時保存データを削除
  delTmpData(FUNC_ID_CSTREGIST_SEARCHRESULT);
}

// ===============================================================
// tmpテーブルからcstIdに紐つく顧客データを取得
// ===============================================================
async function getTmpCstInfo(cstId) {
  const tmpCstInfo = await db.tmp
    .get({ func_id: FUNC_ID_CSTREGIST_CONFIRM })
    .catch((error) => {
      if (tmpCstInfo == null) {
        throw new Error("該当顧客入力情報なし");
      }
    });
  // パラメータ入力
  setCstParam(tmpCstInfo);
}

// ===============================================================
// 顧客入力・確認　パラメータ入力
// ===============================================================
function setCstParam(cstInfo) {
  $("#cst_id").val(cstInfo.cst_id);
  $("#cst_name_lst").val(cstInfo.cst_name_lst);
  $("#cst_name_fst").val(cstInfo.cst_name_fst);
  $("#cst_name_kana_lst").val(cstInfo.cst_name_kana_lst);
  $("#cst_name_kana_fst").val(cstInfo.cst_name_kana_fst);
  if (cstInfo.sex == "1") {
    $("input:radio[name='radio_sex']").val(["1"]);
  } else {
    $("input:radio[name='radio_sex']").val(["2"]);
  }
  $("#birthday").val(cstInfo.birthday);
  $("#home_tel").val(cstInfo.home_tel);
  $("#mbl_tel").val(cstInfo.mbl_tel);
  $("#mailaddr").val(cstInfo.mailaddr);
  $("#post_cd").val(cstInfo.post_cd);
  $("#pref_list>option[value='" + cstInfo.pref_cd + "']").prop(
    "selected",
    true
  );
  $("#addr1").val(cstInfo.addr1);
  $("#addr2").val(cstInfo.addr2);
  $("#wkplace_name").val(cstInfo.wkplace_name);
  $("#wkplace_tel").val(cstInfo.wkplace_tel);
}


// ===============================================================
// tmpテーブルにcstIdに紐つく顧客データを一時保存
// 顧客入力確認画面表示
// ===============================================================
async function setTmpCstInfo(cstId, funcId) {
  // 検索結果画面に紐付くtmpデータを削除
  await db.tmp
    .where({ func_id: funcId })
    .delete()
    .catch((error) => {
      console.error(error);
    });
  await db.tmp
    .put({
      func_id: funcId,
      cst_id: cstId,
      cst_name_lst: $("#cst_name_lst").val(),
      cst_name_fst: $("#cst_name_fst").val(),
      cst_name_kana_lst: $("#cst_name_kana_lst").val(),
      cst_name_kana_fst: $("#cst_name_kana_fst").val(),
      sex: $("input:radio[name='radio_sex']:checked").val(),
      birthday: $("#birthday").val(),
      home_tel: $("#home_tel").val(),
      mbl_tel: $("#mbl_tel").val(),
      mailaddr: $("#mailaddr").val(),
      post_cd: $("#post_cd").val(),
      pref_cd: $("#pref_list>option:selected").val(),
      addr1: $("#addr1").val(),
      addr2: $("#addr2").val(),
      wkplace_name: $("#wkplace_name").val(),
      wkplace_tel: $("#wkplace_tel").val(),
    })
    .catch((error) => {
      throw new Error("一時テーブルへの顧客データ登録失敗");
    });
}

// ===============================================================
// tmpテーブルにappIdに紐つく申請データを一時保存
// 申請情報確認画面表示
// ===============================================================
async function setTmpAppInfo(appId, funcId) {
  // 検索結果画面に紐付くtmpデータを削除
  await db.tmp
    .where({ func_id: funcId })
    .delete()
    .catch((error) => {
      console.error(error);
    });

  // 申込情報を取得
  const appInfo = await db.app.get({ app_id: appId })

  await db.tmp
    .put({
      func_id: funcId,
      cst_id: $("#cst_id").val(),
      cst_name_lst: $("#cst_name_lst").val(),
      cst_name_fst: $("#cst_name_fst").val(),
      cst_name_kana_lst: $("#cst_name_kana_lst").val(),
      cst_name_kana_fst: $("#cst_name_kana_fst").val(),
      sex: $("input:radio[name='radio_sex']:checked").val(),
      birthday: $("#birthday").val(),
      home_tel: $("#home_tel").val(),
      mbl_tel: $("#mbl_tel").val(),
      mailaddr: $("#mailaddr").val(),
      post_cd: $("#post_cd").val(),
      pref_cd: $("#pref_list>option:selected").val(),
      addr1: $("#addr1").val(),
      addr2: $("#addr2").val(),
      wkplace_name: $("#wkplace_name").val(),
      wkplace_tel: $("#wkplace_tel").val(),
      app_id: appInfo.app_id,
      app_status: appInfo.app_status,
      app_date: appInfo.app_date,
      app_user_id: appInfo.app_user_id,
      aprv_div: appInfo.aprv_div,
    })
    .catch((error) => {
      throw new Error("一時テーブルへの申請データ登録失敗");
    });
}

// ===============================================================
// 登録済の申請データのうち申請IDのMAX値を取得
// ===============================================================
async function getNewAppId() {
  return await db.app
    .orderBy("app_id")
    .last()
    .catch((error) => {
      throw new Error("申請ID取得エラー");
    });
}

// ===============================================================
// 登録済の顧客データのうち顧客IDのMAX値を取得
// ===============================================================
async function getNewCstId() {
  return await db.customer
    .orderBy("cst_id")
    .last()
    .catch((error) => {
      throw new Error("顧客ID取得エラー");
    });
}

// ===============================================================
// 申請ID、申請日に紐つく申請データを取得し画面に表示
// 申請情報検索
// ===============================================================
async function appSearch(appId, appDateFr, appDateTo) {
  let result = [];

  $("table").remove();

  if (appDateFr > appDateTo) {
    throw new Error("日付の大小が不正");
  }

  let appList = await db.app.toArray()
  if (appList.length == 0) {
    throw new Error("申請データなし");
  }

  for (let ap of appList) {
    if (appId != "") {
      if (ap.app_id == appId) {
        result.push(ap);
      }
    } else {
      if (appDateFr != "" && appDateTo != "") {
        if (ap.app_date >= appDateFr && ap.app_date <= appDateTo) {
          result.push(ap);
        }
      }
    }
  }
  if (result.length == 0) {
    throw new Error("検索結果0件");
  }

  $("#appList").append(appTableTag);

  // 画面表示用にパラメータ変換
  let i = 0;
  for (let res of result) {
    // パラメータ置換
    let appUserName = ""
    await getUserData(res.app_user_id)
      .then((user) => {
        appUserName = user.login_name
      })
    if (appUserName == "") {
      break;
    }

    let tmpTag = appListTag;
    tmpTag = tmpTag.replace("{$no}", i + 1);
    tmpTag = tmpTag.replaceAll("{$appId}", res.app_id);
    tmpTag = tmpTag.replace("{$aprvDivName}", getAppDivName(res.aprv_div));
    tmpTag = tmpTag.replace("{$appStatusName}", getAppStatusName(res.app_status));
    tmpTag = tmpTag.replace("{$appUserName}", appUserName);
    tmpTag = tmpTag.replace("{$appDate}", res.app_date);

    $("tbody").append(tmpTag);
    i++;
  }
}

