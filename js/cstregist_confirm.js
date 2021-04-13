$(document).ready(function () {
  initdb();

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;
  let cstId = prms.get("cstId");

  getPrefList().then(() => {
    getTmpCstInfo(FUNC_ID_CSTREGIST_CONFIRM)
      .then((tmpCstInfo) => {
        // パラメータ入力
        setCstParam(tmpCstInfo);
      })
      .catch((error) => {
        // エラーメッセージ表示させる？
        window.location.href = "./index.html";
      });
  });
  if (cstId == null) {
    // 新規登録の場合
    getPrefList()
      .then((prefListTag) => {
        // 都道府県リストをセット
        $("#pref_list").append(prefListTag);
        $("label[for='cst_id']").remove();
        $("#cst_id").remove();
      })
      .catch(() => {
        window.location.href = "./index.html";
      });
  }

  $("#cstregist_complete").on("click", function () {
    // ボタン連打対策
    $("#cstregist_complete").prop("disabled", true);
    // 申請情報、顧客情報を登録
    setCstInfo(FUNC_ID_CSTREGIST_CONFIRM)
      .then((cId) => {
        cstId = cId;
        setTmpCstInfo(cstId, FUNC_ID_CSTREGIST_CONFIRM).then(() => {
          setAppInfo(FUNC_ID_CSTREGIST_CONFIRM).then((appId) => {
            // 顧客入力確認画面用の一時保存データを削除
            delTmpData(FUNC_ID_CSTREGIST_CONFIRM);
            // 名寄せ検索結果画面用の一時保存データを削除
            delTmpData(FUNC_ID_CSTREGIST_SEARCHRESULT);
            // 顧客情報申請完了画面へ
            window.location.href =
              "./cstregist_complete.html?" +
              "cstId=" +
              cstId +
              "&appId=" +
              appId;
          });
        });
      })
      .catch((error) => {
        // 完了画面にエラー表示
      });
  });
  $("#backtocstinput").on("click", function () {
    // 顧客情報入力画面へ戻る

    // 戻った時に入力していた値を保持していてほしい。。。
    // tmpにも同じ顧客データを保存し、そのデータを引っ張り出す
    window.location.href = "./cstregist_input.html" + "?cstId=" + cstId;
  });
});
