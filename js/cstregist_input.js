$(document).ready(function () {
  initdb();

  $('#birthday').datepicker({
    language: 'ja',
    format: 'yyyy/mm/dd'
  });

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;

  getPrefList().then(() => {
    getCstInfo(prms.get("cstId")).catch(() => {
      window.location.href = "./index.html";
    });
  });

  $("#cstregistconfirm").on("click", function () {
    // ボタン連打対策
    $("#cstregistconfirm").prop("disabled", true);
    // パラメータチェック
    // checkCstParam()
    // .then (() =>{
    // tmpに顧客情報入力画面の各パラメータを一時保存
    setTmpCstInfo(prms.get("cstId"), FUNC_ID_CSTREGIST_CONFIRM)
      .then(() => {
        // 顧客情報確認画面へ
        window.location.href =
          "./cstregist_confirm.html" + "?cstId=" + prms.get("cstId");
      })
      .catch((error) => {
        window.location.href = "./index.html";
      });
    // }
    // .catch (() => {
    //    // エラーメッセージ表示
    // })
  });
  $("#backtosearchresult").on("click", function () {
    // 名寄せ検索結果画面に戻る
    window.location.href = "./cstregist_searchresult.html";
  });
});
