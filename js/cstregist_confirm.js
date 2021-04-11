$(document).ready(function () {
  initdb();
  bulkputdb();

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;

  getPrefList()
  getTmpCstInfo(prms.get('cstId'))
    .catch((error) => {
      // window.location.href = "./index.html"
    });
  $("#cstregist_confirm").on("click", function () {
    // ボタン連打対策
    $("#cstregist_confirm").prop("disabled", true);
    // 顧客情報確認画面へ
    window.location.href = "./cstregist_complete.html";
  });
  $("#backtocstinput").on("click", function () {
    // 顧客情報入力画面へ戻る
    window.location.href = "./cstregist_input.html" + "?cstId=" + prms.get('cstId');
  });
});
