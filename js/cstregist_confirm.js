$(document).ready(function () {
  initdb();

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;
  let cstId = prms.get("cstId");

  getTmpData(FUNC_ID_CSTREGIST_CONFIRM)
    .then((tmpList) => {
      // パラメータ入力        
      if (tmpList.length == 1) {
        setCstParam(FUNC_ID_CSTREGIST_CONFIRM, tmpList[0]);
      } else {
        // tmpに顧客入力情報が複数あるためエラー
        window.location.href = "./index.html";
      }
    })
  if (cstId == null) {
    // 新規登録の場合
    $("label[for='cst_id']").remove();
    $("#cst_id").remove();
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
    let urlPrm = ""
    if (cstId != null) {
      urlPrm = "?cstId=" + cstId;
    }
    window.location.href = "./cstregist_input.html" + urlPrm
  });
});
