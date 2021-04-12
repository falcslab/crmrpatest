$(document).ready(function () {
  initdb();

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;

  getPrefList().then(() => {
    getAppInfo(prms.get("appId")).catch((error) => {
      // エラーメッセージ表示させる？
      // window.location.href = "./index.html";
    });
  });

  $("#appaprv_complete").on("click", function () {
    // ボタン連打対策
    $("#appaprv_complete").prop("disabled", true);

    // 承認ステータス更新

    // 顧客マスタ登録 or 更新
  });
  $("#backtoappsearch").on("click", function () {
    // 申請情報検索画面へ戻る
    window.location.href =
      "./appaprv_search.html";
  });
});
