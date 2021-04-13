$(document).ready(function () {
  initdb();

  const url = new URL(window.location.href);
  const prms = url.searchParams;
  let cstId = prms.get("cstId");
  let appId = prms.get("appId");

  if (cstId == null || appId == null) {
    window.location.href = "./index.html";
  }

  // 発行された申請ID、顧客IDを画面表示
  $("#appid").html("<b>" + appId + "</b>");
  // 発行された申請IDを画面表示
  $("#cstid").html("<b>" + cstId + "</b>");

  $("#backtomain").on("click", function () {
    // メインメニューに戻る
    window.location.href = "./main.html";
  });
});
