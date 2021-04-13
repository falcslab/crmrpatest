$(document).ready(function () {
  initdb();

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;
  const appId = prms.get("appId");
  let cstId = "";

  getPrefList()
    .then((prefListTag) => {
      // 都道府県リストをセット
      $("#pref_list").append(prefListTag);

      getAppInfo(appId)
        .then((appInfo) => {
          cstId = appInfo.cst_id;
          getCstInfo(cstId).then((cstInfo) => {
            // パラメータ入力
            setCstParam(cstInfo);
            // tmpに申請データを一時保存
            setTmpAppInfo(appId, FUNC_ID_APP_CONFIRM).catch((error) => {
              // エラーメッセージ表示させる？
            });
          });
        })
        .catch((error) => {
          // エラーメッセージ表示させる？
          // window.location.href = "./index.html";
        });
    })
    .catch((error) => {
      // window.location.href = "./index.html";
    });

  $("#appaprv_complete").on("click", function () {
    // ボタン連打対策
    $("#appaprv_complete").prop("disabled", true);
    // 顧客マスタの承認ステータス、承認者、承認日を更新
    updAprvAppInfo(appId)
      .then(() => {
        updAprvCstInfo(cstId)
          .then(() => {
            // 申請情報確認画面用の一時保存データを削除
            delTmpData(FUNC_ID_APP_CONFIRM);
            // 申請情報承認完了画面へ
            window.location.href =
              "./appaprv_complete.html?" + "cstId=" + cstId + "&appId=" + appId;
          })
          .catch((error) => {
            window.location.href = "./index.html";
          });
      })
      .catch((error) => {
        // window.location.href = "./index.html";
      });
  });
  $("#backtoappsearch").on("click", function () {
    // 申請情報検索画面へ戻る
    window.location.href = "./appaprv_search.html";
  });
});
