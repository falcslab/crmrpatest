$(document).ready(function () {
  //DB初期化
  initdb();
  bulkputdb();

  // tmpに保存されたログイン情報を削除
  delTmpData(FUNC_ID_LOGIN);

  $("#btnlogin").on("click", function () {
    // ボタン連打対策
    $("#btnlogin").prop("disabled", true);
    login($("#loginid").val(), $("#loginpw").val())
      .then(() => {
        window.location.href = "./main.html";
      })
      .catch((error) => {
        // 該当ユーザーが存在しない場合
        $("#btnlogin").prop("disabled", false);
      });
  });
  // .then(() => {
  // })
  // .catch((error) => {
  //   // 何もしない
  // });
});
