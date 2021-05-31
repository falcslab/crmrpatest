$(document).ready(function () {
  initdb();
  bulkputdb();

  $("#custinquiry").on("click", function () {
    // ボタン連打対策
    $("#custinquiry").prop("disabled", true);
    // 名寄せ検索画面へ
    window.location.href = "./cstlist_search.html";
  });
  $("#custregist").on("click", function () {
    // ボタン連打対策
    $("#custregist").prop("disabled", true);
    // 名寄せ検索画面へ
    window.location.href = "./cstregist_search.html";
  });
  $("#appaprvsearch").on("click", function () {
    // ボタン連打対策
    $("#appaprvsearch").prop("disabled", true);
    // 申請承認画面へ
    window.location.href = "./appaprv_search.html";
  });
});
