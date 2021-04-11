$(document).ready(function () {
  //DB初期化
  initdb();
  bulkputdb();

  $("#btnlogin").on("click", function () {
    // ボタン連打対策
    $("#btnlogin").prop("disabled", true);
    login($("#loginid").val(), $("#loginpw").val())
      .then(() => {
        window.location.href = './main.html';
      }).catch((error) => {
        $("#btnlogin").prop("disabled", false);
        console.log("ログインエラー")
      })
  })
  // .then(() => {
  // })
  // .catch((error) => {
  //   // 何もしない
  // });
});
