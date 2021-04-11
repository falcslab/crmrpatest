const db = new Dexie("cmsRPATest");
const cstListTag =
  "<tr><th>{$no}</th><td><a href='./cstregist_input.html?cstId={$cstId}' name='cstIdlink'>{$cstId}</button></td><td>{$cstNameLst}</td><td>{$cstNameFst}</td>" +
  "<td>{$cstNameKanaLst}</td><td>{$cstNameKanaFst}</td><td>{$birthDay}</td>" +
  "<td>{$homeTel}</td><td>{$mblTel}</td></tr>";
const prefTag = "<option value={$prefCd}>{$prefName}</option>"

function initdb() {
  db.version(1).stores({
    user: "&login_id, login_name, login_pw",
    pref: "pref_cd, pref_name",
    customer:
      "cst_id, cst_name_fst, cst_name_lst, cst_name_kana_fst, cst_name_kana_lst, birthday, home_tel, mbl_tel",
    tmp: "++id, func_id, cst_id",
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

async function login(loginid, loginpw) {
  const loginuser = await db.user.get({ login_id: loginid, login_pw: loginpw });
  if (loginuser == null) {
    throw new Error("ログインエラー");
  }
}

// 名寄せ検索
async function cstsearch(
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
  await db.tmp.where({ "func_id": FUNC_ID_CSTREGIST_RESULT })
    .delete().catch((error) => {
      console.error(error);
    });

  if (result.length != 0) {
    for (let res of result) {
      // 検索結果画面のIDをセット
      res.func_id = FUNC_ID_CSTREGIST_RESULT;
      await db.tmp.put(res).catch((error) => {
        console.error(error);
      });
    }
  } else {
    throw new Error("検索エラー");
  }
}

async function getCstSearchResult() {
  let tmpArr = [];

  await db.tmp
    .where("func_id")
    .equals(FUNC_ID_CSTREGIST_RESULT)
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

async function getPrefList() {
  let prefListTag = ""
  const pref = await db.pref.toArray()
  for (let pf of pref) {
    let tmpSelectPrefTag = prefTag
    tmpSelectPrefTag = tmpSelectPrefTag.replace("{$prefCd}", pf.pref_cd);
    tmpSelectPrefTag = tmpSelectPrefTag.replace("{$prefName}", pf.pref_name);
    prefListTag = prefListTag + tmpSelectPrefTag
  }
  $("#pref_list").append(prefListTag);

}

async function getCstInfo(cstId) {
  const cstInfo = await db.customer.get({ "cst_id": cstId })
  if (cstInfo == null) {
    throw new Error("該当顧客情報なし");
  }
  // パラメータ入力
  $("#cst_id").val(cstInfo.cst_id);
  $("#cst_name_lst").val(cstInfo.cst_name_lst);
  $("#cst_name_fst").val(cstInfo.cst_name_fst);
  $("#cst_name_kana_lst").val(cstInfo.cst_name_kana_lst);
  $("#cst_name_kana_fst").val(cstInfo.cst_name_kana_fst);
  if (cstInfo.sex == "1") {
    $("input:radio[name='radio_sex']").val(['man']);
  } else {
    $("input:radio[name='radio_sex']").val(['woman']);
  }
  $("#birthday").val(cstInfo.birthday);
  $("#home_tel").val(cstInfo.home_tel);
  $("#mbl_tel").val(cstInfo.mbl_tel);
  $("#mailaddr").val(cstInfo.mailaddr);
  $("#post_cd").val(cstInfo.post_cd);
  $("#pref_list option[value='" + cstInfo.pref_cd + "']").prop("selected", true);
  $("#addr1").val(cstInfo.addr1);
  $("#addr2").val(cstInfo.addr2);
  $("#wkplace_name").val(cstInfo.wkplace_name);
  $("#wkplace_tel").val(cstInfo.wkplace_tel);
}

// ===========================================================================

async function getDbStationByStNm(stFrNm, stToNm) {
  let stFrArr = [];
  let stToArr = [];
  let result = [];

  let errorbox =
    '<div id="searchError" class="boxError" ><span>{$errormsg}</span></div>';
  let errormsg = "";

  // tmpテーブルをtruncate
  await db.tmp.clear();

  // エラーメッセージを消す
  $("div#searchError").remove();

  // 入力チェック
  if (stFrNm == "") {
    errormsg = makeErrorMsg(errormsg, "出発地を入力してください。");
  }
  if (stToNm == "") {
    errormsg = makeErrorMsg(errormsg, "到着地を入力してください。");
  }
  if (errormsg != "") {
    returnError(errorbox, errormsg);
    throw new Error("入力エラー");
  }

  // stFrNm（出発駅名）に紐つく駅一覧を取得
  await db.station
    .where("station_name")
    .equals(stFrNm.trim())
    .each((station) => {
      const tmpStArr = {
        station_cd: station.station_cd,
        line_cd: station.line_cd,
        station_name: station.station_name,
      };
      stFrArr.push(tmpStArr);
    });

  if (stFrArr.length == 0) {
    errormsg = errormsg + "該当する出発地が見つかりませんでした。";
  }

  // stToNm（到着駅名）に紐つく駅一覧を取得
  await db.station
    .where("station_name")
    .equals(stToNm.trim())
    .each((station) => {
      const tmpToArr = {
        station_cd: station.station_cd,
        line_cd: station.line_cd,
        station_name: station.station_name,
      };
      stToArr.push(tmpToArr);
    });

  if (stToArr.length == 0) {
    errormsg = makeErrorMsg(errormsg, "該当する到着地が見つかりませんでした。");
  }
  if (errormsg != "") {
    returnError(errorbox, errormsg);
    throw new Error("到着地エラー");
  }

  for (const stFr of stFrArr) {
    for (const stTo of stToArr) {
      // 出発駅の路線上に到着駅が存在するかチェック
      const resLineBySt = await db.join.get({
        line_cd: stFr.line_cd,
        station_cd1: stTo.station_cd,
      });

      if (resLineBySt == null) {
        continue;
      }

      // 路線名を検索
      const resLine = await db.line.get({ line_cd: stFr.line_cd });
      if (resLine == null) {
        continue;
      }

      // 路線名を配列に追加
      const lineNm = resLine.line_name;

      // 運賃,所要時間,到着駅までの駅数を配列に追加
      const [fare, reqTime] = calc(stFr.station_cd, stTo.station_cd);

      // 到着時間計算
      let dt = new Date(
        $("select#y").val(),
        $("select#m").val(),
        $("select#d").val(),
        $("select#hh").val(),
        $("select#mm").val()
      );
      dt.setMinutes(dt.getMinutes() + reqTime);

      // 検索画面の各入力項目をセット
      const searchDate =
        $("select#y").val() +
        "年" +
        $("select#m").val() +
        "月" +
        $("select#d").val() +
        "日";
      const searchTime =
        $("select#hh").val() + "時" + $("select#mm").val() + "分";
      const depTime = $("select#hh").val() + ":" + $("select#mm").val();
      const arvTime =
        ("00" + dt.getHours()).slice(-2) +
        ":" +
        ("00" + dt.getMinutes()).slice(-2);

      // 【未対応】ラジオボタンの選択によって末尾の文言変更

      result.push(stFr.station_cd);

      // tmpテーブルに検索結果を保存
      await db.tmp
        .put({
          line_cd: stFr.line_cd,
          line_name: lineNm,
          station_name_fr: stFr.station_name,
          station_name_to: stTo.station_name,
          search_date: searchDate,
          search_time: searchTime,
          departure: depTime,
          arrive: arvTime,
          req_time: reqTime,
          fare: fare,
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  // 路線名を配列に追加
  if (result.length == 0) {
    // 検索結果0件の場合
    errormsg = makeErrorMsg(errormsg, "検索結果が0件でした。");
    returnError(errorbox, errormsg);
    throw new Error("検索結果0件");
  }
}

// 運賃計算
function calc(station_cd_fr, station_cd_to) {
  const stcdfr = Number(station_cd_fr);
  const tocdfr = Number(station_cd_to);

  const stcnt = Math.abs(stcdfr - tocdfr);
  const fare = basefare + stcnt * addfare;
  const reqTime = stcnt * addBaseMinutes;

  return [fare, reqTime];
}

function returnError(errorbox, errormsg) {
  // ボタン連打対策
  $("#btnSearch").prop("disabled", false);
  $("div#errorinfo").append(errorbox.replace("{$errormsg}", errormsg));
}

function makeErrorMsg(errstr, errormsg) {
  if (errstr != "") {
    // 頭に改行を入れる
    errstr = errstr + "<br/>";
  }
  errstr = errstr + errormsg;

  return errstr;
}

// tmpテーブルから全件取得
async function getTmpData() {
  let tmpArr = [];

  // awaitを入れないとforループが先に走ってしまい画面に結果が表示されない
  await db.tmp.toArray().then((tmp) => {
    tmpArr.push(tmp);
  });

  // 画面表示用にパラメータ変換
  let i = 0;
  for (let tm of tmpArr[0]) {
    // パラメータ置換
    let tmpTag = routeTag;
    tmpTag = tmpTag.replaceAll("{$routeNo}", i + 1);
    tmpTag = tmpTag.replace("{$stTime}", tm.search_time);
    tmpTag = tmpTag.replace("{$departure}", tm.departure);
    tmpTag = tmpTag.replace("{$arrive}", tm.arrive);
    tmpTag = tmpTag.replace("{$reqTime}", tm.req_time + "分");
    tmpTag = tmpTag.replace("{$fare}", tm.fare);

    $("ul#rtList").append(tmpTag);

    $("span#searchDate").text(tm.search_date);
    $("span#searchTime").text(tm.search_time);
    $("span#route" + (i + 1) + "disp").text(
      tm.station_name_fr + " → （" + tm.line_name + "） → " + tm.station_name_to
    );
    i++;
  }
}
