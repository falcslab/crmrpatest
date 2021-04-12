$(document).ready(function () {
  initdb();

  $('#app_date_fr,#app_date_to').datepicker({
    language: 'ja',
    format: 'yyyy/mm/dd'
  });

  $("#btnappsearch").on("click", function () {
    // ボタン連打対策
    $("#btnappsearch").prop("disabled", true);
    appSearch(
      $("#app_id").val(),
      $("#app_date_fr").val(),
      $("#app_date_to").val(),
    )
      .then(() => {
        $("#btnappsearch").prop("disabled", false);
      })
      .catch((error) => {
        $("#btnappsearch").prop("disabled", false);
      });
  });
  $("#backtomain").on("click", function () {
    // メインメニューに戻る
    window.location.href = "./main.html";
  });
});
