const dbName = "cmsRPATest";
const db = new Dexie(dbName);
const cstListTag =
  "<tr><th>{$no}</th><td><a href='./cstregist_input.html?cstId={$cstId}' name='cstIdlink'>{$cstId}</button></td><td>{$cstNameLst}</td><td>{$cstNameFst}</td>" +
  "<td>{$cstNameKanaLst}</td><td>{$cstNameKanaFst}</td><td>{$birthDay}</td>" +
  "<td>{$homeTel}</td><td>{$mblTel}</td></tr>";
const cstListViewTag =
  "<tr><th>{$no}</th><td>{$cstId}</td><td>{$cstNameLst}</td><td>{$cstNameFst}</td>" +
  "<td>{$cstNameKanaLst}</td><td>{$cstNameKanaFst}</td><td>{$birthDay}</td>" +
  "<td>{$homeTel}</td><td>{$mblTel}</td></tr>";
const appTableTag =
  "<table class='table table-striped appList'><thead><tr><th>#</th><th>申請ID</th><th>承認区分</th><th>申請ステータス</th>" +
  "<th>申請者</th><th>申請日</th><th>承認者</th><th>承認日</th></tr></thead><tbody></tbody></table>";
const appListTag =
  "<tr><th>{$no}</th><td><a href='./appaprv_confirm.html?appId={$appId}' name='appIdlink'>{$appId}</button></td><td>{$aprvDivName}</td>" +
  "<td>{$appStatusName}</td><td>{$appUserName}</td><td>{$appDate}</td><td>{$aprvUserName}</td><td>{$aprvDate}</td>";
const prefTag =
  "<option id='prefcd_{$prefCd}' value={$prefCd}>{$prefName}</option>";

function initdb() {
  db.version(1).stores({
    user: "&login_id, login_pw",
    pref: "&pref_cd",
    customer:
      "&cst_id, cst_name_fst, cst_name_lst, cst_name_kana_fst, cst_name_kana_lst, birthday, home_tel, mbl_tel, app_status",
    app: "&app_id, cst_id, app_user_id",
    tmp: "++id, func_id, app_id, cst_id, login_id",
  });
}

async function bulkputdb() {
  await db.user.bulkPut(m_user).catch((error) => {
    console.error(error);
  });

  await db.pref.bulkPut(m_pref).catch((error) => {
    console.error(error);
  });

  // デフォルトのデータが入っていたらbulkputしない
  const cstList = [];
  await db.customer
    .where("cst_id")
    .equals("100000")
    .each((cst) => {
      cstList.push(cst);
    });

  if (cstList.length == 0) {
    await db.customer.bulkPut(m_customer).catch((error) => {
      console.error(error);
    });
  }
}

// ===============================================================
// customerテーブルの全データを削除
// ===============================================================
async function delCstData() {
  await db.customer.clear().catch((error) => {
    console.error(error);
  });
}

// ===============================================================
// appテーブルの全データを削除
// ===============================================================
async function delAppData() {
  await db.app.clear().catch((error) => {
    console.error(error);
  });
}

// ===============================================================
// userIdに紐つくユーザー情報を取得
// ===============================================================
async function getUserData(userId) {
  return await db.user.get({ login_id: userId }).catch((error) => {
    throw new Error("該当ユーザーなし");
  });
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
async function loginCheck() {
  const loginInfo = await db.tmp
    .get({
      func_id: FUNC_ID_LOGIN,
    })
    .catch((error) => {
      // tmpにログイン情報がない場合はログインエラー
      throw new Error("ログインエラー");
    });

  return loginInfo;
}

// ===============================================================
// prefCdに紐つく都道府県名を取得
// ===============================================================
async function getPrefName(prefCd) {
  return db.pref.get({ pref_cd: Number(prefCd) }).catch((error) => {
    throw new Error("該当する都道府県なし");
  });
}

// ===============================================================
// func_cdに紐つくtmpテーブルのデータを削除
// ===============================================================
async function delTmpData(funcId) {
  if (funcId === FUNC_ID_ALL) {
    await db.tmp.clear().catch((error) => {
      console.error(error);
    });
  } else {
    await db.tmp
      .where({
        func_id: funcId,
      })
      .delete()
      .catch((error) => {
        console.error(error);
      });
  }
}

// ===============================================================
// 顧客検索を実施してtmpテーブルに一時保存
// ===============================================================
async function cstListSearch(
  cstId,
  cstNameFst,
  cstNameLst,
  cstNameKanaFst,
  cstNameKanaLst
) {
  // 申請ステータスが承認済のもののみ対象とする
  let searchCol = { app_status: APP_APPROVED };

  if (cstId !== "") {
    searchCol.cst_id = cstId;
  } else {
    if (cstNameFst !== "") {
      searchCol.cst_name_fst = cstNameFst;
    }
    if (cstNameLst !== "") {
      searchCol.cst_name_lst = cstNameLst;
    }
    if (cstNameKanaFst !== "") {
      searchCol.cst_name_kana_fst = cstNameKanaFst;
    }
    if (cstNameKanaLst !== "") {
      searchCol.cst_name_kana_lst = cstNameKanaLst;
    }
  }

  let result = [];
  await db.customer
    .where(searchCol)
    .each((cst) => {
      result.push(cst);
    })
    .catch((error) => {
      console.error(error);
    });

  // 検索結果画面に紐付くtmpデータを削除
  await db.tmp
    .where({ func_id: FUNC_ID_CSTLIST_SEARCHRESULT })
    .delete()
    .catch((error) => {
      console.error(error);
    });

  if (result.length > 0) {
    for (let res of result) {
      // 検索結果画面のIDをセット
      res.func_id = FUNC_ID_CSTLIST_SEARCHRESULT;
      await db.tmp.put(res).catch((error) => {
        console.error(error);
      });
    }
  } else {
    throw new Error("検索エラー");
  }
}

// ===============================================================
// 顧客検索結果をtmpテーブルから取得して画面に表示
// ===============================================================
async function getCstListSearchResult() {
  let tmpArr = [];

  await db.tmp
    .where("func_id")
    .equals(FUNC_ID_CSTLIST_SEARCHRESULT)
    .each((tmp) => {
      tmpArr.push(tmp);
    });
  if (tmpArr.length === 0) {
    throw new Error("検索結果0件");
  }

  // 画面表示用にパラメータ変換
  let i = 0;
  for (let tm of tmpArr) {
    // パラメータ置換
    let tmpTag = cstListViewTag;
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
  // 申請ステータスが承認済のもののみ対象とする
  let searchCol = { app_status: APP_APPROVED };
  if (cstNameFst !== "") {
    searchCol.cst_name_fst = cstNameFst;
  }
  if (cstNameLst !== "") {
    searchCol.cst_name_lst = cstNameLst;
  }
  if (cstNameKanaFst !== "") {
    searchCol.cst_name_kana_fst = cstNameKanaFst;
  }
  if (cstNameKanaLst !== "") {
    searchCol.cst_name_kana_lst = cstNameKanaLst;
  }
  if (birthDay !== "") {
    searchCol.birthday = birthDay;
  }
  if (homeTel !== "") {
    searchCol.home_tel = homeTel;
  }
  if (mblTel !== "") {
    searchCol.mbl_tel = mblTel;
  }

  let result = [];
  await db.customer
    .where(searchCol)
    .each((cst) => {
      result.push(cst);
    })
    .catch((error) => {
      console.error(error);
    });

  // 検索結果画面に紐付くtmpデータを削除
  await db.tmp
    .where({ func_id: FUNC_ID_CSTREGIST_SEARCHRESULT })
    .delete()
    .catch((error) => {
      console.error(error);
    });

  if (result.length > 0) {
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
  if (tmpArr.length === 0) {
    throw new Error("検索結果0件");
  } else {
    // 検索結果件数をメッセージに埋め込む
    let infoMsg = INFOMSG_SEARCH_DATA_COUNT;
    infoMsg = infoMsg.replace("{$count}", tmpArr.length);
    setInfoMsg(infoMsg);
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
  const pref = await db.pref.orderBy("pref_cd").toArray();
  for (let pf of pref) {
    let tmpSelectPrefTag = prefTag;
    tmpSelectPrefTag = tmpSelectPrefTag.replaceAll("{$prefCd}", pf.pref_cd);
    tmpSelectPrefTag = tmpSelectPrefTag.replace("{$prefName}", pf.pref_name);
    prefListTag = prefListTag + tmpSelectPrefTag;
  }
  return prefListTag;
}

// ===============================================================
// cstIdに紐つく顧客情報を取得
// ===============================================================
async function getCstInfo(cstId) {
  const cstInfo = await db.customer.get({ cst_id: cstId });
  if (cstInfo === null) {
    throw new Error("該当顧客情報なし");
  }
  return cstInfo;
}

// ===============================================================
// 顧客入力画面のデータをもとに顧客マスタに登録
// ===============================================================
async function setCstInfo(funcId) {
  const tmpCstInfo = await db.tmp.get({ func_id: funcId }).catch((error) => {
    throw new Error("該当申請情報なし");
  });

  let cstId = "";
  if (tmpCstInfo.cst_id !== "") {
    cstId = tmpCstInfo.cst_id;
  } else {
    // 顧客マスタからcst_idのMax値+1を取得
    await getNewCstId()
      .then((maxCstId) => {
        cstId = String(Number(maxCstId) + 1);
      })
      .catch((error) => {
        //顧客マスタ0件の場合
        cstId = c_cstId;
      });
  }

  // 顧客マスタに更新 or 登録
  await db.customer
    .put({
      cst_id: cstId,
      cst_name_lst: tmpCstInfo.cst_name_lst,
      cst_name_fst: tmpCstInfo.cst_name_fst,
      cst_name_kana_lst: tmpCstInfo.cst_name_kana_lst,
      cst_name_kana_fst: tmpCstInfo.cst_name_kana_fst,
      sex: tmpCstInfo.sex,
      birthday: tmpCstInfo.birthday,
      home_tel: tmpCstInfo.home_tel,
      mbl_tel: tmpCstInfo.mbl_tel,
      mailaddr: tmpCstInfo.mailaddr,
      post_cd: tmpCstInfo.post_cd,
      pref_cd: tmpCstInfo.pref_cd,
      addr1: tmpCstInfo.addr1,
      addr2: tmpCstInfo.addr2,
      wkplace_name: tmpCstInfo.wkplace_name,
      wkplace_tel: tmpCstInfo.wkplace_tel,
      app_status: APP_BEFAPPR,
      aprv_user_id: "",
      aprv_date: "",
    })
    .catch((error) => {
      throw new Error("顧客マスタ登録失敗");
    });

  return cstId;
}

// ===============================================================
// 申請承認後、顧客マスタを更新
// ===============================================================
async function updAprvCstInfo(cstId) {
  const cstInfo = await getCstInfo(cstId);

  // 顧客マスタを更新
  await db.customer
    .put({
      cst_id: cstId,
      cst_name_lst: cstInfo.cst_name_lst,
      cst_name_fst: cstInfo.cst_name_fst,
      cst_name_kana_lst: cstInfo.cst_name_kana_lst,
      cst_name_kana_fst: cstInfo.cst_name_kana_fst,
      sex: cstInfo.sex,
      birthday: cstInfo.birthday,
      home_tel: cstInfo.home_tel,
      mbl_tel: cstInfo.mbl_tel,
      mailaddr: cstInfo.mailaddr,
      post_cd: cstInfo.post_cd,
      pref_cd: cstInfo.pref_cd,
      addr1: cstInfo.addr1,
      addr2: cstInfo.addr2,
      wkplace_name: cstInfo.wkplace_name,
      wkplace_tel: cstInfo.wkplace_tel,
      app_status: APP_APPROVED,
      aprv_user_id: c_loginId,
      aprv_date: formatDate(),
    })
    .catch((error) => {
      throw new Error("顧客マスタ更新失敗");
    });
}

// ===============================================================
// 申請承認後、申請データを更新
// ===============================================================
async function updAprvAppInfo(appId) {
  const appInfo = await getAppInfo(appId);
  // 申請データを更新
  await db.app
    .put({
      app_id: appId,
      cst_id: appInfo.cst_id,
      app_status: APP_APPROVED,
      aprv_user_id: c_loginId,
      app_date: appInfo.app_date,
      aprv_date: formatDate(),
      aprv_div: appInfo.aprv_div,
    })
    .catch((error) => {
      throw new Error("申請データ更新失敗");
    });
}

// ===============================================================
// 申請情報を画面にインプット
// ===============================================================
async function getAppInfo(appId) {
  const appInfo = await db.app.get({ app_id: appId });
  if (appInfo === null) {
    throw new Error("該当申請情報なし");
  }
  return appInfo;
}

// ===============================================================
// 顧客入力完了
// ===============================================================
async function setAppInfo(funcId) {
  // tmpから顧客情報を取得
  const tmpCstInfo = await db.tmp.get({ func_id: funcId }).catch((error) => {
    throw new Error("該当顧客入力情報なし");
  });

  // 申請テーブルからapp_idのMax値+1を取得
  let appId = "";
  await getNewAppId()
    .then((maxAppId) => {
      appId = String(Number(maxAppId) + 1);
    })
    .catch((error) => {
      // 申請データ0件の場合
      appId = c_appId;
    });

  // 申請テーブル登録
  await db.app
    .put({
      app_id: appId,
      cst_id: tmpCstInfo.cst_id,
      app_status: APP_BEFAPPR,
      app_date: formatDate(),
      app_user_id: c_loginId,
      aprv_div: APPDIV_CUSTOMERREGIST,
      aprv_date: "",
      aprv_user_id: "",
    })
    .catch((error) => {
      throw new Error("顧客情報更新失敗");
    });

  return appId;
}

// ===============================================================
// tmpテーブルからfuncIdに紐つく顧客データを取得
// ===============================================================
async function getTmpData(funcId) {
  let tmpList = [];
  await db.tmp.where({ func_id: funcId }).each((tmp) => {
    tmpList.push(tmp);
  });
  return tmpList;
}

// ===============================================================
// tmpテーブルにcstIdに紐つく顧客データを一時保存
// 顧客入力確認画面表示
// ===============================================================
async function setTmpCstInfo(cstId, funcId) {
  await db.tmp
    .where({ func_id: funcId })
    .delete()
    .catch((error) => {
      throw new Error("一時テーブルの顧客データ削除失敗");
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
  // 申込情報を取得
  let appInfo = await db.app.get({ app_id: appId }).catch((error) => {
    throw new Error("該当申請情報なし");
  });

  await db.tmp
    .put({
      func_id: funcId,
      app_id: appInfo.app_id,
      app_status: appInfo.app_status,
      app_date: appInfo.app_date,
      app_user_id: appInfo.app_user_id,
      aprv_div: appInfo.aprv_div,
      aprv_date: "",
    })
    .catch((error) => {
      throw new Error("一時テーブルへの申請データ登録失敗");
    });
}

// ===============================================================
// 登録済の申請データのうち申請IDのMAX値を取得
// ===============================================================
async function getNewAppId() {
  let appId = "";
  const app = await db.app
    .orderBy("app_id")
    .last()
    .catch((error) => {
      throw new Error("申請ID取得エラー");
    });
  if (app !== null) {
    appId = app.app_id;
  }
  return appId;
}

// ===============================================================
// 登録済の顧客データのうち顧客IDのMAX値を取得
// ===============================================================
async function getNewCstId() {
  let cstId = "";
  const cst = await db.customer
    .orderBy("cst_id")
    .last()
    .catch((error) => {
      throw new Error("顧客ID取得エラー");
    });
  if (cst !== null) {
    cstId = cst.cst_id;
  }
  return cstId;
}

// ===============================================================
// 申請ID、申請日に紐つく申請データを取得し画面に表示
// 申請情報検索
// ===============================================================
async function appSearch(appId, appDateFr, appDateTo) {
  let result = [];

  await db.app.toArray().then((appList) => {
    for (let app of appList) {
      if (appId !== "") {
        if (app.app_id === appId) {
          result.push(app);
        }
      } else {
        if (appDateFr !== "" && appDateTo !== "") {
          if (app.app_date >= appDateFr && app.app_date <= appDateTo) {
            result.push(app);
          }
        } else {
          // 検索項目すべてブランクの場合、全件表示
          result.push(app);
        }
      }
    }
  });
  if (result.length === 0) {
    throw new Error("検索結果0件");
  }
  return result;
}

// ===============================================================
// 申請一覧表示
// ===============================================================
async function dispAppList(appList) {
  $("#appList").append(appTableTag);

  // 画面表示用にパラメータ変換
  let i = 0;
  for (let ap of appList) {
    // パラメータ置換
    let appUserName = "";
    let aprvUserName = "";
    await getUserData(ap.app_user_id)
      .then((user) => {
        appUserName = user.login_name;
      })
      .catch((error) => {
        // 該当するユーザーが見つからなかった場合
      });
    await getUserData(ap.aprv_user_id)
      .then((user) => {
        aprvUserName = user.login_name;
      })
      .catch((error) => {
        // 該当するユーザーが見つからなかった場合
      });

    let tmpTag = appListTag;
    tmpTag = tmpTag.replace("{$no}", i + 1);
    tmpTag = tmpTag.replaceAll("{$appId}", ap.app_id);
    tmpTag = tmpTag.replace("{$aprvDivName}", getAppDivName(ap.aprv_div));
    tmpTag = tmpTag.replace(
      "{$appStatusName}",
      getAppStatusName(ap.app_status)
    );
    tmpTag = tmpTag.replace("{$appUserName}", appUserName);
    tmpTag = tmpTag.replace("{$appDate}", ap.app_date);
    tmpTag = tmpTag.replace("{$aprvUserName}", aprvUserName);
    tmpTag = tmpTag.replace("{$aprvDate}", ap.aprv_date);

    $("tbody").append(tmpTag);
    i++;
  }
}
