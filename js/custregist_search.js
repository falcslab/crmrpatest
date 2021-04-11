$(document).ready(function () {
  initdb();
  bulkputdb();

  $("#btncstsearch").on("click", function () {
    // ボタン連打対策
    $("#btncstsearch").prop("disabled", true);
    cstsearch($("#cust_name_fst").val(), $("#cust_name_lst").val(), $("#cust_name_kana_fst").val(),
      $("#cust_name_kana_lst").val(), $("#birthday").val(), $("#home_tel").val(), $("#mbl_tel").val())
    // 名寄せ検索結果画面へ
    window.location.href = './custregist_searchresult.html';
  })
  $("#backtomain").on("click", function () {
    // メインメニューに戻る
    window.location.href = './main.html';
  })

});
