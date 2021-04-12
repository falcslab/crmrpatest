$(document).ready(function () {
  initdb();

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;

  // tmpに申請情報確認画面の各パラメータを一時保存

  getPrefList()
    .then(() => {
      getAppInfo(prms.get("appId"))
        .then((app) => {
          setTmpAppInfo(prms.get("appId"), FUNC_ID_APP_CONFIRM)
            .catch((error) => {
              // エラーメッセージ表示させる？
            })
        }).catch((error) => {
          // エラーメッセージ表示させる？
          // window.location.href = "./index.html";
        });
    })
    .catch((error) => {
      window.location.href = "./index.html";
    });

  $("#appaprv_complete").on("click", function () {
    // ボタン連打対策
    $("#appaprv_complete").prop("disabled", true);
    // 顧客マスタ登録 or 更新
    setCstInfo()
      .then(() => {
        // 承認ステータス更新

      })
      .catch(() => {

      })


  });
  $("#backtoappsearch").on("click", function () {
    // 申請情報検索画面へ戻る
    window.location.href =
      "./appaprv_search.html";
  });
});
