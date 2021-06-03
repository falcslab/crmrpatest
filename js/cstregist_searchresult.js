$(document).ready(function () {
  initdb();

  $("div.alert").remove();

  getCstSearchResult().catch(() => {
    window.location.href = "./index.html";
  });
  $("#backtosearch").on("click", function () {
    // 名寄せ検索画面に戻る
    window.location.href = "./cstregist_search.html";
  });
  $("#btncstresist").on("click", function () {
    // 顧客情報入力画面へ
    window.location.href = "./cstregist_input.html";
  });
});
