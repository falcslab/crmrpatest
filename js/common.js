// 共通関数
const FUNC_ID_LOGIN = "1";
const FUNC_ID_MAIN = "2";
const FUNC_ID_CSTREGIST_SEARCH = "3";
const FUNC_ID_CSTREGIST_RESULT = "4";
const FUNC_ID_CSTREGIST_INPUT = "5";
const FUNC_ID_CSTREGIST_CONFIRM = "6";
const FUNC_ID_CSTREGIST_COMPLETE = "7";
const FUNC_ID_APP_LIST = "8";
const FUNC_ID_APP_CONFIRM = "9";
const FUNC_ID_APP_COMPLETE = "10";

let headerTag = '<header><div><h1 class="title">' +
    '<a href="./main.html">顧客管理システム</a></h1></div>'

$(function () {
    $("#header").append(headerTag);
    $("#footer").append('<footer><p class="copyright">Copyright © 2021 Falcs All Rights Reserved.</p></footer>');
});
