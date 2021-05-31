$(document).ready(function () {
  initdb();

  $("div.alert").remove();

  getCstListSearchResult().catch(() => {
    window.location.href = "./index.html";
  });
  $("#backtosearch").on("click", function () {
    // 顧客検索画面に戻る
    window.location.href = "./cstlist_search.html";
  });
});
