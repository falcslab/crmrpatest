$(document).ready(function() {
    initdb();

    $("#birthday").datepicker({
        language: "ja",
        format: "yyyy/mm/dd",
    });

    $("#btncstsearch").on("click", function() {
        // ボタン連打対策
        $("#btncstsearch").prop("disabled", true);

        if (!checkSearchParam()) {
            $("#btncstsearch").prop("disabled", false);
            return
        }

        cstSearch(
                $("#cst_name_fst").val(),
                $("#cst_name_lst").val(),
                $("#cst_name_kana_fst").val(),
                $("#cst_name_kana_lst").val(),
                $("#birthday").val(),
                $("#home_tel").val(),
                $("#mbl_tel").val()
            )
            .then(() => {
                // 名寄せ検索結果画面へ
                window.location.href = "./cstregist_searchresult.html";
            })
            .catch((error) => {
                $("#btncstsearch").prop("disabled", false);
                setWarnMsg(ERRORMSG_SEARCH_NO_DATA);
            });
    });
    $("#btncstresist").on("click", function() {
        // 顧客情報入力画面へ
        window.location.href = "./cstregist_input.html";
    });
    $("#backtomain").on("click", function() {
        // メインメニューに戻る
        window.location.href = "./main.html";
    });
});

function checkSearchParam() {
    let errorMsg = "";
    let res = false;

    const cstNameLst = $("#cst_name_lst").val()
    const cstNameKanaLst = $("#cst_name_kana_lst").val()
    const cstNameKanaFst = $("#cst_name_kana_fst").val()
    const birthDay = $("#birthday").val()
    const homeTel = $("#home_tel").val()
    const mblTel = $("#mbl_tel").val()

    if (cstNameLst === "") {
        errorMsg = addMsg(errorMsg, ERRORMSG_NAME_LST_REQUIRED)
    }
    if (cstNameKanaLst !== "" && !checkKana(cstNameKanaLst)) {
        errorMsg = addMsg(errorMsg, ERRORMSG_KANA_LST_FORMAT)
    }
    if (cstNameKanaFst !== "" && !checkKana(cstNameKanaFst)) {
        errorMsg = addMsg(errorMsg, ERRORMSG_KANA_FST_FORMAT)
    }
    if (birthDay !== "" && !checkDate(birthDay)) {
        errorMsg = addMsg(errorMsg, ERRORMSG_BIRTHDAY_FORMAT)
    }
    if (homeTel !== "" && !checkTel(homeTel)) {
        errorMsg = addMsg(errorMsg, ERRORMSG_HOME_TEL_FORMAT)
    }
    if (mblTel !== "" && !checkMblTel(mblTel)) {
        errorMsg = addMsg(errorMsg, ERRORMSG_MBL_TEL_FORMAT)
    }
    if (errorMsg !== "") {
        $("div.alert").remove();
        setErrorMsg(errorMsg);
    } else {
        res = true;
    }
    return res;
}