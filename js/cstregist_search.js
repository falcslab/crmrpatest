$(document).ready(function () {
  initdb();

  $("#birthday").datepicker({
    language: "ja",
    format: "yyyy/mm/dd",
  });

  $("#btncstsearch").on("click", function () {
    // ボタン連打対策
    $("#btncstsearch").prop("disabled", true);
    cstSearch(
      $("#cst_name_fst").val(),
      $("#cst_name_lst").val(),
      $("#cst_name_kana_fst").val(),
      $("#cst_name_kana_lst").val(),
      $("#birthday").val(),
      $("#home_tel").val(),
      $("#mbl_tel").val()
    )
      .then(() => {
        // 名寄せ検索結果画面へ
        window.location.href = "./cstregist_searchresult.html";
      })
      .catch((error) => {
        $("#btncstsearch").prop("disabled", false);
        console.log("検索エラー");
      });
  });
  $("#btncstresist").on("click", function () {
    // 顧客情報入力画面へ
    window.location.href = "./cstregist_input.html";
  });
  $("#backtomain").on("click", function () {
    // メインメニューに戻る
    window.location.href = "./main.html";
  });
});
