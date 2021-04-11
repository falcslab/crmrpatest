$(document).ready(function () {
  $("#custregist").on("click", function () {
    // ボタン連打対策
    $("").prop("disabled", true);
    // 顧客情報入力画面へ
    window.location.href = './custregist_input.html';
  })
});
