$(document).ready(function () {
  initdb();
  bulkputdb();

  getCstSearchResult().catch(() => {
    window.location.href = "./index.html"
  });

  $("#backtosearch").on("click", function () {
    // 名寄せ検索画面に戻る
    window.location.href = "./cstregist_search.html";
  });

});
