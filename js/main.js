$(document).ready(function () {
  initdb();
  bulkputdb();

  $("#custinquiry").on("click", function () {
    // ボタン連打対策
    // $("#custinquiry").prop("disabled", true);
    alert("custinquiry");
    // login($("#loginid").val(), $("#loginpw").val())
    //   .then(() => {
    //     window.location.href = './main.html';
    //   }).catch((error) => {
    //     $("#btnlogin").prop("disabled", false);
    //     console.log("ログインエラー")
    //   })
  });
  $("#custregist").on("click", function () {
    // ボタン連打対策
    $("#custregist").prop("disabled", true);
    // 名寄せ検索画面へ
    window.location.href = "./cstregist_search.html";
  });
  $("#appaprv").on("click", function () {
    // ボタン連打対策
    $("#appaprv").prop("disabled", true);
  });
});
