$(document).ready(function () {
  initdb();

  $("#birthday").datepicker({
    language: "ja",
    format: "yyyy/mm/dd",
  });

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;
  let cstId = prms.get("cstId");

  if (cstId != null) {
    // 既存顧客更新の場合
    getPrefList().then((prefListTag) => {
      // 都道府県リストをセット
      $("#pref_list").append(prefListTag);

      getCstInfo(cstId)
        .then((cstInfo) => {
          // パラメータ入力
          setCstParam(FUNC_ID_CSTREGIST_INPUT, cstInfo);
          $("#backtosearch").remove();
        })
        .catch(() => {
          window.location.href = "./index.html";
        });
    });
  } else {
    // 新規登録の場合
    getPrefList()
      .then((prefListTag) => {
        // 都道府県リストをセット
        $("#pref_list").append(prefListTag);
        $("label[for='cst_id']").remove();
        $("#cst_id").remove();
        $("#backtosearchresult").remove();
      })
      .catch(() => {
        window.location.href = "./index.html";
      });
  }

  $("#cstregistconfirm").on("click", function () {
    // ボタン連打対策
    $("#cstregistconfirm").prop("disabled", true);
    // パラメータチェック
    // checkCstParam()
    // .then (() =>{
    let urlPrm = "";
    if (cstId != null) {
      // 既存顧客の場合はURLパラメータにcstIdを付ける
      urlPrm = "?cstId=" + cstId;
    } else {
      cstId = "";
    }
    // tmpに顧客情報入力画面の各パラメータを一時保存
    setTmpCstInfo(cstId, FUNC_ID_CSTREGIST_CONFIRM)
      .then(() => {
        // 顧客情報確認画面へ
        window.location.href = "./cstregist_confirm.html" + urlPrm;
      })
      .catch((error) => {
        window.location.href = "./index.html";
      });
    // }
    // .catch (() => {
    //    // エラーメッセージ表示
    // })
  });

  // テストデータをセットする
  $("#setCstTestData").on("click", function () {
    setCstTestData();
  });
  $("#backtosearch").on("click", function () {
    // 名寄せ検索画面に戻る
    window.location.href = "./cstregist_search.html";
  });
  $("#backtosearchresult").on("click", function () {
    // 名寄せ検索結果画面に戻る
    window.location.href = "./cstregist_searchresult.html";
  });
});
