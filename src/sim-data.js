define(["jquery", "chosen","pitcherData", "batterData"], function($, c, p, b) {

  // duplication necessary because jquery doesn't seem to like reusing a variable
  var batterlist = $('<select name="player-name" class="playerselect"></select>');
  var pitcherlist = $('<select name="player-name" class="playerselect"></select>');

  // Set default value
  batterlist.append($('<option value="None" selected="Selected">Select player</option>'));
  pitcherlist.append($('<option value="None" selected="Selected">Select player</option>'));

  // Bind players to dropdowns
  $(p).each(function(index, element) {
      pitcherlist
        .append($('<option></option>')
        .data('player', element)
        .text(element.nameFull + ", " + element.yearID + ", " + element.setID));
  });
  $.each(b, function(index, element) {
      batterlist
        .append($('<option></option>')
        .data('player', element)
        .text(element.nameFull + ", " + element.yearID + ", " + element.setID));
  });
  
  $('.pitcherselect-td').append(pitcherlist);
  $('.batterselect-td').append(batterlist);

  //Set up chosen dropdowns
  $('.playerselect').chosen({
    disable_search_threshold: 10,
    no_results_text: "Oops, nothing found!",
    width: "85%"
  });
  // Because data takes so long to load...
  $('.loading').removeClass('loading').empty();


});