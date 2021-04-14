$(document).ready(function () {
  initdb();

  //URLから顧客IDを取得
  const url = new URL(window.location.href);
  const prms = url.searchParams;
  const appId = prms.get("appId");
  let cstId = "";

  getAppInfo(appId)
    .then((appInfo) => {
      cstId = appInfo.cst_id;

      // 申請ステータスが承認待ちでない場合はボタン制御
      if (appInfo.app_status != APP_BEFAPPR) {
        // 差戻の場合
        $("#appaprv_remand").remove();
        $("#appaprv_complete").remove();
      }

      // ログインユーザーが申請者の場合、差戻/承認ボタンを非表示
      getTmpData(FUNC_ID_LOGIN).then((login) => {
        if (appInfo.app_user_id == login[0].login_id) {
          $("#appaprv_remand").remove();
          $("#appaprv_complete").remove();
        }
      })

      getCstInfo(cstId).then((cstInfo) => {
        // パラメータ入力
        setCstParam(FUNC_ID_APP_CONFIRM, cstInfo);
        // tmpに申請データを一時保存
        setTmpAppInfo(appId, FUNC_ID_APP_CONFIRM).catch((error) => {
          // エラーメッセージ表示させる？
        });
      });
    })
    .catch((error) => {
      // window.location.href = "./index.html";
    });

  $("#appaprv_complete").on("click", function () {
    // ボタン連打対策
    $("#appaprv_complete").prop("disabled", true);
    // 顧客マスタの申請ステータス、承認者、承認日を更新
    updAprvAppInfo(appId)
      .then(() => {
        updAprvCstInfo(cstId)
          .then(() => {
            // 申請情報確認画面用の一時保存データを削除
            delTmpData(FUNC_ID_APP_CONFIRM);
            // 申請情報検索画面用の一時保存データを削除
            delTmpData(FUNC_ID_APP_SEARCH);
            // 申請情報承認完了画面へ
            window.location.href =
              "./appaprv_complete.html?" + "cstId=" + cstId + "&appId=" + appId;
          })
          .catch((error) => {
            window.location.href = "./index.html";
          });
      })
      .catch((error) => {
        window.location.href = "./index.html";
      });
  });
  $("#backtoappsearch").on("click", function () {
    // 申請情報確認画面用の一時保存データを削除
    delTmpData(FUNC_ID_APP_CONFIRM).then(() => {
      // 申請情報検索画面へ戻る
      window.location.href = "./appaprv_search.html";
    })
  });
});
