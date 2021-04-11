$(document).ready(function () {
  initdb();
  bulkputdb();

  getCstSearchResult();
  // $("#custregist").on("click", function () {
  //   // ボタン連打対策
  //   $("").prop("disabled", true);
  //   // 顧客情報入力画面へ
  //   window.location.href = "./custregist_input.html";
  // });
  $("#backtosearchresult").on("click", function () {
    // 名寄せ検索結果画面に戻る
    window.location.href = "./cstregist_searchresult.html";
  });
});
