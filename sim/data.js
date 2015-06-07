define(["jquery", "chosen","pitcherData", "batterData"], function($, c, p, b) {

  // Bind players to dropdowns
  $(p).each(function(index, element) {
      $('.pitcherselect').append($('<option>').data('player', element).text(element.nameFull + ", " + element.yearID + ", " + element.setID));
  });
  $(b).each(function(index, element) {
      $('.batterselect').append($('<option>').data('player', element).text(element.nameFull + ", " + element.yearID + ", " + element.setID));
  });
  
  // Set up chosen dropdowns
  $('.playerselect').chosen({
    disable_search_threshold: 10,
    no_results_text: "Oops, nothing found!",
    width: "85%"
  });
  // Because chosen loads the data for a long time...
  $('.loading').removeClass('loading').empty();


});