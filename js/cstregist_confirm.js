$(document).ready(function () {
  initdb();

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;

  getPrefList().then(() => {
    getTmpCstInfo(prms.get("cstId")).catch((error) => {
      // エラーメッセージ表示させる？
      window.location.href = "./index.html";
    });
  });

  $("#cstregist_complete").on("click", function () {
    // ボタン連打対策
    $("#cstregist_complete").prop("disabled", true);
    // tmpに顧客情報入力画面の各パラメータを一時保存
    setAppInfo()
      .then(() => {
        // 顧客情報確認画面へ
        window.location.href = "./cstregist_complete.html";
      })
      .catch((error) => {
        // 完了画面にエラー表示
      });
  });
  $("#backtocstinput").on("click", function () {
    // 顧客情報入力画面へ戻る

    // 戻った時に入力していた値を保持していてほしい。。。
    // tmpにも同じ顧客データを保存し、そのデータを引っ張り出す
    window.location.href =
      "./cstregist_input.html" + "?cstId=" + prms.get("cstId");
  });
});
