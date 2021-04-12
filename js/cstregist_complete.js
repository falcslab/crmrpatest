$(document).ready(function () {
  initdb();

  //URLから顧客IDを取得
  // const url = new URL(window.location.href);
  // const prms = url.searchParams;

  getNewCstId()
    .then((app) => {
      // 発行された申請IDを画面表示
      $("#newappid").html("<b>" + app.app_id + "</b>");
    })
    .catch((error) => {
      window.location.href = "./index.html";
    });

  $("#backtomain").on("click", function () {
    // メインメニューに戻る
    window.location.href = "./main.html";
  });
});
