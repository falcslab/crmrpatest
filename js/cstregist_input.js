$(document).ready(function () {
  initdb();

  $("#birthday").datepicker({
    language: "ja",
    format: "yyyy/mm/dd",
  });

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;
  let cstId = prms.get("cstId");

  if (cstId !== null) {
    // 既存顧客更新の場合
    getPrefList().then((prefListTag) => {
      // 都道府県リストをセット
      $("#pref_list").append(prefListTag);

      getCstInfo(cstId)
        .then((cstInfo) => {
          // パラメータ入力
          setCstParam(FUNC_ID_CSTREGIST_INPUT, cstInfo);
        })
        .catch(() => {
          window.location.href = "./index.html";
        });
    });
  } else {
    // 新規登録の場合
    getTmpData(FUNC_ID_CSTREGIST_CONFIRM).then((tmpList) => {
      if (tmpList.length === 1) {
        setCstParam(FUNC_ID_CSTREGIST_INPUT, tmpList[0]);
      }
    });

    getPrefList()
      .then((prefListTag) => {
        // 都道府県リストをセット
        $("#pref_list").append(prefListTag);
        $("label[for='cst_id']").remove();
        $("#cst_id").remove();
        $("#backtosearchresult").remove();
      })
      .catch(() => {
        window.location.href = "./index.html";
      });
  }

  $("#cstregistconfirm").on("click", function () {
    // ボタン連打対策
    $("#cstregistconfirm").prop("disabled", true);

    // パラメータチェック
    if (!checkCstParam()) {
      $("#cstregistconfirm").prop("disabled", false);
      return;
    }

    let urlPrm = "";
    if (cstId !== null) {
      // 既存顧客の場合はURLパラメータにcstIdを付ける
      urlPrm = "?cstId=" + cstId;
    } else {
      cstId = "";
    }
    // tmpに顧客情報入力画面の各パラメータを一時保存
    setTmpCstInfo(cstId, FUNC_ID_CSTREGIST_CONFIRM)
      .then(() => {
        // 顧客情報確認画面へ
        window.location.href = "./cstregist_confirm.html" + urlPrm;
      })
      .catch((error) => {
        window.location.href = "./index.html";
      });
  });

  // テストデータをセットする
  $("#setCstTestData").on("click", function () {
    setCstTestData();
  });
  $("#backtosearch").on("click", function () {
    // 顧客入力確認画面用の一時保存データを削除
    delTmpData(FUNC_ID_CSTREGIST_CONFIRM).then(() => {
      // 名寄せ検索画面に戻る
      window.location.href = "./cstregist_search.html";
    });
  });
  $("#backtosearchresult").on("click", function () {
    // 顧客入力確認画面用の一時保存データを削除
    delTmpData(FUNC_ID_CSTREGIST_CONFIRM).then(() => {
      // 名寄せ検索結果画面に戻る
      window.location.href = "./cstregist_searchresult.html";
    });
  });
});

function checkCstParam() {
  let errorMsg = "";
  let res = false;

  const cstNameLst = $("#cst_name_lst").val();
  const cstNameFst = $("#cst_name_fst").val();
  const cstNameKanaLst = $("#cst_name_kana_lst").val();
  const cstNameKanaFst = $("#cst_name_kana_fst").val();
  const birthDay = $("#birthday").val();
  const homeTel = $("#home_tel").val();
  const mblTel = $("#mbl_tel").val();
  const mailaddr = $("#mailaddr").val();
  const postCd = $("#post_cd").val();
  const addr1 = $("#addr1").val();
  const wkplaceTel = $("#wkplace_tel").val();

  if (cstNameLst === "") {
    errorMsg = addMsg(errorMsg, ERRORMSG_NAME_LST_REQUIRED);
  }
  if (cstNameFst === "") {
    errorMsg = addMsg(errorMsg, ERRORMSG_NAME_FST_REQUIRED);
  }
  if (cstNameKanaLst !== "") {
    if (!checkKana(cstNameKanaLst)) {
      errorMsg = addMsg(errorMsg, ERRORMSG_KANA_LST_FORMAT);
    }
  } else {
    errorMsg = addMsg(errorMsg, ERRORMSG_KANA_LST_REQUIRED);
  }
  if (cstNameKanaFst !== "") {
    if (!checkKana(cstNameKanaFst)) {
      errorMsg = addMsg(errorMsg, ERRORMSG_KANA_FST_FORMAT);
    }
  } else {
    errorMsg = addMsg(errorMsg, ERRORMSG_KANA_FST_REQUIRED);
  }
  if (birthDay !== "") {
    if (!checkDate(birthDay)) {
      errorMsg = addMsg(errorMsg, ERRORMSG_BIRTHDAY_FORMAT);
    }
  } else {
    errorMsg = addMsg(errorMsg, ERRORMSG_BIRTHDAY_REQUIRED);
  }
  if (homeTel !== "" || mblTel !== "") {
    if (homeTel !== "" && !checkTel(homeTel)) {
      errorMsg = addMsg(errorMsg, ERRORMSG_HOME_TEL_FORMAT);
    }
    if (mblTel !== "" && !checkMblTel(mblTel)) {
      errorMsg = addMsg(errorMsg, ERRORMSG_MBL_TEL_FORMAT);
    }
  } else {
    errorMsg = addMsg(errorMsg, ERRORMSG_TEL_REQUIRED);
  }
  if (mailaddr !== "") {
    if (!checkMail(mailaddr)) {
      errorMsg = addMsg(errorMsg, ERRORMSG_MAILADDR_FORMAT);
    }
  } else {
    errorMsg = addMsg(errorMsg, ERRORMSG_MAILADDR_REQUIRED);
  }
  if (postCd !== "") {
    if (!checkPostCd(postCd)) {
      errorMsg = addMsg(errorMsg, ERRORMSG_POST_CD_FORMAT);
    }
  } else {
    errorMsg = addMsg(errorMsg, ERRORMSG_POST_CD_REQUIRED);
  }
  if (addr1 === "") {
    errorMsg = addMsg(errorMsg, ERRORMSG_ADDR1_REQUIRED);
  }
  if (wkplaceTel !== "" && !checkTel(wkplaceTel)) {
    errorMsg = addMsg(errorMsg, ERRORMSG_WKPLACE_TEL_FORMAT);
  }
  if (errorMsg !== "") {
    $("div.alert").remove();
    setErrorMsg(errorMsg);
  } else {
    res = true;
  }
  return res;
}
