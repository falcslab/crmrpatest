$(document).ready(function () {
  initdb();

  $("#app_date_fr,#app_date_to").datepicker({
    language: "ja",
    format: "yyyy/mm/dd",
  });

  $("table").remove();

  getTmpData(FUNC_ID_APP_SEARCH).then((tmpList) => {
    if (tmpList.length > 0) {
      dispAppList(tmpList);
    }
  });

  $("#btnappsearch").on("click", function () {
    // ボタン連打対策
    $("#btnappsearch").prop("disabled", true);

    if (!checkSearchParam()) {
      $("#btnappsearch").prop("disabled", false);
      return;
    }

    const appId = $("#app_id").val();
    const appDateFr = $("#app_date_fr").val();
    const appDateTo = $("#app_date_to").val();

    $("table").remove();
    $("div.alert").remove();

    // 検索
    delTmpData(FUNC_ID_APP_SEARCH).then(() => {
      appSearch(appId, appDateFr, appDateTo)
        .then((appList) => {
          dispAppList(appList);
          // tmpテーブルに検索結果を一時保存
          for (let ap of appList) {
            setTmpAppInfo(ap.app_id, FUNC_ID_APP_SEARCH);
          }
        })
        .catch((error) => {
          $("#btnappsearch").prop("disabled", false);
          setWarnMsg(ERRORMSG_SEARCH_NO_DATA);
          return;
        });
    });

    $("#btnappsearch").prop("disabled", false);
  });

  $("#backtomain").on("click", function () {
    delTmpData(FUNC_ID_APP_SEARCH).then(() => {
      // メインメニューに戻る
      window.location.href = "./main.html";
    });
  });
});

function checkSearchParam() {
  let errorMsg = "";
  let res = false;

  const appId = $("#app_id").val();

  if (appId !== "" && !checkAppId(appId)) {
    errorMsg = addMsg(errorMsg, ERRORMSG_APP_ID_FORMAT);
  }
  if (errorMsg !== "") {
    $("div.alert").remove();
    setErrorMsg(errorMsg);
  } else {
    res = true;
  }
  return res;
}
