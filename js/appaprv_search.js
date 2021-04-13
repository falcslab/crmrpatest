$(document).ready(function () {
  initdb();

  $('#app_date_fr,#app_date_to').datepicker({
    language: 'ja',
    format: 'yyyy/mm/dd'
  });

  $("table").remove();

  let tmpAppList = [];
  getTmpData(FUNC_ID_APP_SEARCH)
    .then((tmp) => {
      if (tmp != null) {
        tmpAppList.push(tmp)
        dispAppList(tmpAppList)
      }
    });

  $("#btnappsearch").on("click", function () {
    // ボタン連打対策
    $("#btnappsearch").prop("disabled", true);

    const appId = $("#app_id").val();
    const appDateFr = $("#app_date_fr").val();
    const appDateTo = $("#app_date_to").val();

    $("table").remove();

    // 検索
    delTmpData(FUNC_ID_APP_SEARCH).then(() => {
      appSearch(appId, appDateFr, appDateTo).then((appList) => {
        dispAppList(appList)
        // tmpテーブルに検索結果を一時保存
        for (let ap of appList) {
          setTmpAppInfo(ap.app_Id, FUNC_ID_APP_SEARCH)
        }
      })
    })

    $("#btnappsearch").prop("disabled", false);
  })

  $("#backtomain").on("click", function () {
    // メインメニューに戻る
    window.location.href = "./main.html";
  });

});