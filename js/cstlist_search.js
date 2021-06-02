$(document).ready(function () {
  initdb();

  $("#btncstlistsearch").on("click", function () {
    // ボタン連打対策
    $("#btncstlistsearch").prop("disabled", true);

    if (!checkSearchParam()) {
      $("#btncstlistsearch").prop("disabled", false);
      return;
    }

    cstListSearch(
      $("#cst_id").val(),
      $("#cst_name_fst").val(),
      $("#cst_name_lst").val(),
      $("#cst_name_kana_fst").val(),
      $("#cst_name_kana_lst").val()
    )
      .then(() => {
        // 顧客検索結果画面へ
        window.location.href = "./cstlist_searchresult.html";
      })
      .catch((error) => {
        $("#btncstsearch").prop("disabled", false);
        setWarnMsg(ERRORMSG_SEARCH_NO_DATA);
      });
  });
  $("#backtomain").on("click", function () {
    // メインメニューに戻る
    window.location.href = "./main.html";
  });
});

function checkSearchParam() {
  let errorMsg = "";
  let res = false;

  const cstId = $("#cst_id").val();
  const cstNameKanaLst = $("#cst_name_kana_lst").val();
  const cstNameKanaFst = $("#cst_name_kana_fst").val();

  if (cstId !== "" && !checkCstId(cstId)) {
    errorMsg = addMsg(errorMsg, ERRORMSG_CST_ID_FORMAT);
  }
  if (cstNameKanaLst !== "" && !checkKana(cstNameKanaLst)) {
    errorMsg = addMsg(errorMsg, ERRORMSG_KANA_LST_FORMAT);
  }
  if (cstNameKanaFst !== "" && !checkKana(cstNameKanaFst)) {
    errorMsg = addMsg(errorMsg, ERRORMSG_KANA_FST_FORMAT);
  }
  if (errorMsg !== "") {
    $("div.alert").remove();
    setErrorMsg(errorMsg);
  } else {
    res = true;
  }
  return res;
}
