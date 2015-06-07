define(["jquery","sim/validate"], function($, v) {

  // Initialize validators
  var individualSum20Listeners = [];
  var batChartClassNames = ["p1c","b1c","b2c","b3c","b4c","b5c","b6c","b7c","b8c","b9c"];
  var customV = v.setValidation(9,individualSum20Listeners,batChartClassNames);

  // Change form on user selections
  $("#use-one-bat").change(function() {
    $(".last-eight-batters").toggle();
    $(".lineup-order").toggle();
    v.validateView1();
  });
  $("#use-defense").change(function() {
    $(".defense-input").toggle();
    $(".speed-input").toggle();
  });

  
  // Set values when player is selected
  $('.playerselect').change(function() {
    var player = $(this).find(':selected').data('player');
    if(typeof player !== "undefined"){ // make sure it wasn't set to blank
      $(this).parent().siblings().find('[name=c]').val(player["control"]);
      $(this).parent().siblings().find('[name=ob]').val(player["onbase"]);
      $(this).parent().siblings().find('[name=pu]').val(player["PU"]);
      $(this).parent().siblings().find('[name=so]').val(player["SO"]);
      $(this).parent().siblings().find('[name=gb]').val(player["GB"]);
      $(this).parent().siblings().find('[name=fb]').val(player["FB"]);
      $(this).parent().siblings().find('[name=bb]').val(player["BB"]);
      $(this).parent().siblings().find('[name=1b]').val(player["1B"]);
      $(this).parent().siblings().find('[name=1b\\+]').val(player["1Bplus"]);
      $(this).parent().siblings().find('[name=2b]').val(player["2B"]);
      $(this).parent().siblings().find('[name=3b]').val(player["3B"]);
      $(this).parent().siblings().find('[name=hr]').val(player["HR"]);
      $(this).parent().siblings().find('[name=ip]').val(player["IP"]);
      $(this).parent().siblings().find('[name=sp]').val(player["speed"]);
    }
    else{
      $(this).parent().siblings().find('[name=c]').val("");
      $(this).parent().siblings().find('[name=ob]').val("");
      $(this).parent().siblings().find('[name=pu]').val("");
      $(this).parent().siblings().find('[name=so]').val("");
      $(this).parent().siblings().find('[name=gb]').val("");
      $(this).parent().siblings().find('[name=fb]').val("");
      $(this).parent().siblings().find('[name=bb]').val("");
      $(this).parent().siblings().find('[name=1b]').val("");
      $(this).parent().siblings().find('[name=1b\\+]').val("");
      $(this).parent().siblings().find('[name=2b]').val("");
      $(this).parent().siblings().find('[name=3b]').val("");
      $(this).parent().siblings().find('[name=hr]').val("");
      $(this).parent().siblings().find('[name=ip]').val("");
      $(this).parent().siblings().find('[name=sp]').val("");
    }
    v.validateView1();
  });
  
  var oldState = false, oldoldState = false;
  $('.togglebutton').click(function() {
    $('.input1').toggle();
    $('.input2').toggle();
    $('.input1 :input').prop('disabled', function(i, v) { return !v; });
    $('.input2 :input').prop('disabled', function(i, v) { return !v; });
    $('.togglebutton').toggleClass("button-on");
    oldState = $("#run-simulation").prop("disabled") ? true : false;
    oldoldState ? $("#run-simulation").prop("disabled",true) : $("#run-simulation").prop("disabled",false);
    oldoldState = oldState;
  });
  
  

});