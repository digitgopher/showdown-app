$(window).load(function() {

/********* ALL THE FORM VALIDATING ***********/
  // Pass the classname of a set of chart selects, and it will ensure that they add to 20
  function chartValidateSum(classname) {
    var sum = 0;
    $("select."+classname).each(function(){
      sum += Number($(this).val());
    });
    if(sum == 20){
      $("select."+classname).css("outline", "inherit");
    }
    else if(sum > 20){
      $("select."+classname).css("outline", "2px solid #CF0000");
    }
    else {
      $("select."+classname).css("outline", "2px solid #FF7D7D");
    }
    console.log(sum);
  }
  // So we can make 9 of these in a loop we need to make a closure!
  function addchartValidateSum(name){
    return $("select."+name).change(function() {
      chartValidateSum(name);
    });
  }
  
  // Do all the charts add to 20? Then yes, you can press the run simulation button!
  // Pass a list of all classname sets that have to add to 20.
  function chartValidateAll(listOfClassnames) {
    // Initialize
    var equalsTwenty = true;
    var sum = 0;
    for (var i = 0; i < listOfClassnames.length; i++){
      sum = 0;
      $("select."+listOfClassnames[i]).each(function(){
        sum += Number($(this).val());
      });
      if(sum != 20){
        $("#run-simulation").prop("disabled",true);
        //console.log(sum);
        return;
        //console.log("00000000000000000");
      }
    }
    // They all equal 20
    $("#run-simulation").prop("disabled",false);
    //console.log(sum);
  }
  
  // Add validators as needed
  function setValidation(numBatters,individualSum20Listeners,batChartClassNames){
    for (var i = 0; i < batChartClassNames.length; i++){
      individualSum20Listeners[i] = addchartValidateSum(batChartClassNames[i]);
    }
    $("select.p1c, select.b1c, select.b2c, select.b3c, select.b4c, select.b5c, select.b6c, select.b7c, select.b8c, select.b9c").change(function() {
      chartValidateAll(batChartClassNames);
    });
  }

  // Initialize validators
  // Making them global on purpose so they can be deleted and reset
  individualSum20Listeners = [];
  batChartClassNames = ["p1c","b1c","b2c","b3c","b4c","b5c","b6c","b7c","b8c","b9c"];
  setValidation(9,individualSum20Listeners,batChartClassNames);
  
  // Change form on user selections
  $("#use-one-bat").change(function() {
    $(".last-eight-batters").toggle();
    $(".lineup-order").toggle();
  });
  $("#use-defense").change(function() {
    $(".defense-input").toggle();
    $(".speed-input").toggle();
  });
  
  // Add the validator to a single group:
  // $("select[name='b1c']").change(function() {
    // chartValidateSum("b1c");
  // });

/********* EVERYTHING THAT HAPPENS WHEN THE RUN SIMULATION BUTTON IS CLICKED ***********/
  $('#run-simulation').on("click", function() {
    // Collect all the input data
    var inputValues = $('#inputForm').serializeArray();
    var batters = []; // Contains a set of (key = batter name, value = batter object) objects
    var batter = {}; // Contains the attributes of a batter and their values
    var pitchers = [];
    // Note: defense is treated the same way as a player for getting the input (set off with a player-name value)
    var defense = {}; // Contains the raw defense array
    var pitcher = {};
    //x.push(inputValues[0].value);
    // The first name parameter we expect
    var curGroup = 'p1c';
    var track = 0;
    var curValue = '';
    var previous_name = '';
    // Create a custom data structure
    for (var i = 0; i < inputValues.length; i++){
      var n = inputValues[i].name;
      var v = inputValues[i].value;
      // New player
      if(n == "player-name"){
        // Push old player and make new one
        batter["name"] = previous_name;
        batters.push(batter);
        batter = {};
        // Save current name
        previous_name = v;
        // Track the order of input sets, as objects are unordered
        batter["order"] = track++;
      }
      else{
        batter[n] = v;
      }
      
    }
    // Push last batter as algorithm ends without finishing the job.
    batters.push(batter);
    // Get rid of first ghost object (product of the algorithm)
    batters.shift();
    // Find and separate the pitcher
    pitchers.push(batters.shift());
    // Separate defense
    defense = batters.pop();
    
    // If only the first is input and the simulation is to be run against that batter only, then fill'er up with batter[0]!
    if ($('#use-one-bat')[0].checked){
      batters = new Array(batters.shift());
      for (var i = 1; i <= 8; i++) {
        batters.push(batters[0]);
      }
    }
    // Throw away defense if it is not checked
    var defenseProcessed = []; // Has, in order, cather throwing, infield, and outfield values
    if ($('#use-defense')[0].checked){
      defenseProcessed.push(Number(defense["c"]));
      defenseProcessed.push(Number(defense["1b"]) + Number(defense["2b"]) + Number(defense["ss"]) + Number(defense["3b"]));
      defenseProcessed.push(Number(defense["of1"]) + Number(defense["of2"]) + Number(defense["of3"]));
    }
    else{
      defenseProcessed = 0;
    }

    // Now we have all the input data, print stuff out to confirm:
    
    // Run the simulation and get results
    var results = $.parseJSON(sim(batters, pitchers, defenseProcessed));
    var score = results.pop();
    var presult = results.pop();
    // console.log(results);
    // console.log(presult);
    // console.log(score);
    
    // Prep display
    $(".results-before").contents().filter(function(){ return this.nodeType == 3; }).remove();
    $(".results-before").addClass('results-after');
    $(".results-before").removeClass('results-before');
    
    // Display score
    var scorehtml = "Average number of runs <strong>this</strong> team will score agains <strong>this</strong> pitcher in a 9 inning game: <div class=\"score-val\">"+ score["Score"] + "</div>";
    $(".score-results").empty().html(scorehtml);
    
    // Build batter results
    // TODO: un-hardcode the titles in all the table headings...
    var btbl = "<table><colgroup><col class=\"out-cols\" span=\"3\"><col class=\"ob-cols\" span=\"6\"><col class=\"obp-col\"></colgroup><thead><th>SO</th><th>GB</th><th>FB</th><th>BB</th><th>1B</th><th>1B+</th><th>2B</th><th>3B</th><th>HR</th><th>OBP</th></thead>";
    var odd_even = false;
    $.each(results, function() {
      var tbl_row = "";
      $.each(this, function(k , v) {
          tbl_row += "<td>"+v+"</td>";
      })
      btbl += "<tr class=\""+( odd_even ? "odd" : "even")+"\">"+tbl_row+"</tr>";
      odd_even = !odd_even;
    });
    btbl += "</table>";
    //console.log(btbl);
    // Display batter results
    $(".bat-results").empty().html(btbl);
    
    // Build single pitcher results
    var ptbl = "<table><colgroup><col class=\"out-cols\" span=\"4\"><col class=\"ob-cols\" span=\"4\"><col class=\"obp-col\"></colgroup><thead><th>PU</th><th>SO</th><th>GB</th><th>FB</th><th>BB</th><th>1B</th><th>2B</th><th>HR</th><th>OBP</th></thead>";
    var tbl_row = "";
    $.each(presult, function(k , v) {
      return tbl_row += "<td>"+v+"</td>";
    });
    ptbl += "<tr>"+tbl_row+"</tr></table>";
    // Display pitcher results
    $(".pit-results").empty().html(ptbl);
    

  });
  
  /****************** THE ACTUAL SIMULATION CODE *********************/
  
  //Requirements:
  //  Return the average statistics of the players passed in.
  //    * passed exactly 9 batters and 1 pitcher. TODO: pass single batter, or multiple pitchers with IP
  //    * return the average number of each result as a percentage of average number of plate appearances
  // The function simulates a large number of innings played, and does that many times to average the results. 
  function sim(batters, pitchers, defense){

    // Usage
    // Get first batter: batters[0]
    // Get first batter's chart: batters[0][0]
    // Get first batter's other attributes: batters[0][1]
    // Note: batter's card attributes are split like this so we can loop through atbat result possibilities
    // Example: batters[curBatter][1][0] == onbase value
    // Using arrays because objects aren't ordered!
    // Example of how data should be formatted:
    // var batters = [
      // [[2,2,2,3,5,1,2,1,2],[8,15,"c",6]],
      // [[2,2,2,3,5,1,2,1,2],[8,15,"1b",0]],
      // [[2,2,2,3,5,1,2,1,2],[8,15,"2b",3]],
      // [[2,2,2,3,5,1,2,1,2],[8,15,"ss",3]],
      // [[2,2,2,3,5,1,2,1,2],[8,15,"3b",1]],
      // [[2,2,2,3,5,1,2,1,2],[8,15,"of",1]],
      // [[2,2,2,3,5,1,2,1,2],[8,15,"of",1]],
      // [[2,2,2,3,5,1,2,1,2],[8,15,"of",1]],
      // [[2,2,2,3,5,1,2,1,2],[8,15,"dh",""]]
    // ]
    // console.log(batters);
    // console.log(pitchers);
    
    var useDefense = false;
    if(defense.length > 1){
      useDefense = true;
      var catcher = defense[0];
      var infield = defense[1];
      var outfield = defense[2];
    }
    var temp = new Array();
    
    // Cannot put non-chart values in these mappings!
    var batMapStrict = ["so","gb","fb","bb","1b","1b+","2b","3b","hr"];
    var pitMapStrict = ["pu","so","gb","fb","bb","1b","2b","hr"];
    
    var batMap = {
      0 : "so",
      1 : "gb",
      2 : "fb",
      3 : "bb",
      4 : "1b",
      5 : "1b+",
      6 : "2b",
      7 : "3b",
      8 : "hr",
      // We have to track every result even though you can only get results on certain charts!
      // Hence results are mapped to trackable values.
      "so" : 0,
      "gb" : 1,
      "fb" : 2,
      "bb" : 3,
      "1b" : 4,
      "1b+": 5,
      "2b" : 6,
      "3b" : 7,
      "hr" : 8,
      "pu" : 2 // batter sees a flyball
    }
    // Example pitchers data:
    // var pitchers = [
      // [[2,5,5,4,2,1,1,0],[4,""]]
    // ]
    var pitMap= {
      0 : "pu",
      1 : "so",
      2 : "gb",
      3 : "fb",
      4 : "bb",
      5 : "1b",
      6 : "2b",
      7 : "hr",
      // We have to track every result even though you can only get results on certain charts!
      // Hence results are mapped to trackable values.
      "pu" : 0,
      "so" : 1,
      "gb" : 2,
      "fb" : 3,
      "bb" : 4,
      "1b" : 5,
      "2b" : 6,
      "hr" : 7,
      "1b+": 5, // pitcher sees a normal single
      "3b" : 6  // pitcher sees a double
    }

    // var inningMap = {
      // 1 : "1st",
      // 2 : "2nd",
      // 3 : "3rd",
      // 4 : "4th",
      // 5 : "5th",
      // 6 : "6th",
      // 7 : "7th",
      // 8 : "8th",
      // 9 : "9th"
    // }
    
    // // check that all charts add up to 20
    // for (var i = 0; i < batters.length; i++) {
      // var sum = 0;
      // for (var f = 0; f < batters[i][0].length; f++) {
        // sum += batters[i][0][f];
      // }
      // console.log(sum);
    // }

    // to contain results of each simulation to be averaged together
    
    // Run the simulation 30 times and then get averages.
    // TODO: Let user input this to tradeoff accuracy for speed
    // 10000 is a good speed/accuracy ratio
    var sig = 30; // sig = statistically significant
    for (var a = 0; a < sig; a++){
      // Prepare everything for a simulation
      var bases = [-1,-1,-1]; // Nobody is on base to start with!
      var score = 0; // clear score
      // A place to hold the raw results of the simulation
      var batterTallies = [
        [[0,0,0,0,0,0,0,0,0],[0,0/*How many steals*/,0/*Fielding representation*/]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]],
        [[0,0,0,0,0,0,0,0,0],[0,0,0]]
      ]
      // Don't know what the group pitcherTallies[0][1] is for yet
      var pitcherTallies = [
        [[0,0,0,0,0,0,0,0],[0,0]]
      ]
      var curBatter = 0; // set first batter
      var abres = ''; // current batter's result
      
      
      // We can play as many innings as we want, in multiples of 9 to keep things even.
      var numGames = 162;
      for (var i = 1; i <= 9*numGames; i++) {
        var outs = 0;
        // end inning after 3 outs
        while(outs < 3){
          abres = getResultAtBat();
          //console.log(abres);
          // Out result
          if(abres == "pu" || abres == "so" || abres == "gb" || abres == "fb"){
            outs++;
          }
          // Not an out result
          else{
            advanceRunners(useDefense);
          }
          // Save statistics for display
          logResult();
          // Next batter
          curBatter = (curBatter + 1) % 9;
          if(outs < 3){
            //console.log("Batter "+ curBatter + " up. Inning " + i + ": " + outs + " outs.");
          }
          else{
            //console.log("Inning over. Moving to the "+ (i+1));
          }
          //return;
        }
        // Inning over. Clear the bases
        bases = [-1,-1,-1];
      }
      // Games over
      score /= numGames;
      //console.log(pitcherTallies);
      //console.log(batterTallies);
      // Transform what logResult does into the statistics that will be output
      temp.push(transformRawResultsToStatistics());
      //return;
      //console.log("Simulation results: ");
    
    }

    //console.log(temp);
    // true flag means 9 batters, false means one
    results = averageResults(true); // to contain all results of simulation as json to be displayed in browser
    //console.log(results);
    return JSON.stringify(results, function(key, val) {
      return val.toFixed ? Number(val).toFixed(4).replace(/^0+/, '') : val;
    });
    // End simulation logic
    
    
    
    
    
    
    //*********************
    // Functions below
    
    function getResultAtBat(){
      // console.log("**********");
      // console.log(curBatter);
      // console.log(batters[curBatter][1]);
      // console.log(batters[curBatter][0]);
      // Which chart?
      var pitch = roll();
      if(pitch + Number(pitchers[0]['c']) > Number(batters[curBatter]['ob'])){ // pitcher has advantage!
        return getSwingResult("p");
      }
      else{ // batter has advantage!
        return getSwingResult("b");
      }
      
    }
    
    function getSwingResult(chart){
      var swing = roll();
      //console.log(swing);
      var inc = 0;
      switch(chart){
        case "p":
          for(var x = 0; x < pitMapStrict.length; x++) {
            inc += Number(pitchers[0][pitMapStrict[x]]);
            if(swing <= inc){
              return pitMap[x];
            }
          }
          console.log("Error: No result found on pitcher's chart.");
          break;
        case "b":
          for(var x = 0; x < batMapStrict.length; x++) {
            inc += Number(batters[curBatter][batMapStrict[x]]);
            if(swing <= inc){
              return batMap[x];
            }
          }
          console.log("Error: No result found on batter's chart.");
          break;
        default:
          console.log("Error: don't know whose chart to look at.");
      }
    }

    // Also keeps the score
    function advanceRunners(useDefense){
      switch(abres){
        case "gb":
          result_gb();
          break;
        case "fb":
          result_fb();
          break;
        case "bb":
          result_bb();
          break;
        case "1b":
          result_1b();
          break;
        case "1b+":
          result_1bplus();
          break;
        case "2b":
          result_2b();
          break;
        case "3b":
          result_3b();
          break;
        case "hr":
          result_hr();
          break;
        default:
          console.log("Error: Can't advance runners because hittype not valid.");
      }
    }
    
    function result_gb(){
      
    }
    function result_fb(){
      
    }
    
    // Move runners after a walk
    function result_bb(){
      // No difference if using defense
      if(bases[0] != -1){
        if(bases[1] != -1){
          if(bases[2] != -1){
            // runners on every base...
            score++;
            bases[2] = bases[1];
            bases[1] = bases[0];
            bases[0] = curBatter;
          }
          else{
            // runners on first and second, not third...
            bases[2] = bases[1];
            bases[1] = bases[0];
            bases[0] = curBatter;
          }
        }
        else{
          // runner on first, not second...
          bases[1] = bases[0];
          bases[0] = curBatter;
        }
      }
      else{
        // nobody on first...
        bases[0] = curBatter;
      }
    }
    
    // Move runners after a single
    function result_1b(){
      if(!useDefense){
        if(bases[2] != -1){ // runner on third scores
          score++;
          bases[2] = -1;
        }
        if(bases[1] != -1){ // runner on second goes to third
          bases[2] = bases[1];
          bases[1] = -1;
        }
        if(bases[0] != -1){ // runner on first goes to second
          bases[1] = bases[0];
        }
        bases[0] = curBatter; // and batter occupies first
      }
      else{ // Use defense
        if(bases[2] != -1){ // runner on third scores
          score++;
          bases[2] = -1;
        }
        if(bases[1] != -1){ // runner on second goes to third, then tries for home
          bases[2] = bases[1];
          bases[1] = -1;
          if(roll() + outfield > batters[bases[2]]["sp"] + 5){
            bases[2] = -1;
            outs++;
          }
          else{
            bases[2] = -1;
            score++;
          }
        }
        if(bases[0] != -1){ // runner on first goes to second
          bases[1] = bases[0];
        }
        bases[0] = curBatter; // and batter occupies first
      }
    }
    
    // Move runners on a single plus
    function result_1bplus(){
      if(!useDefense){
        if(bases[2] != -1){ // runner on third scores
          score++;
          bases[2] = -1;
        }
        if(bases[1] != -1){ // runner on second goes to third
          bases[2] = bases[1];
          bases[1] = -1;
        }
        if(bases[0] != -1){ // runner on first goes to second, batter goes to first
          bases[1] = bases[0];
          bases[0] = curBatter;
        }else{ // no runner on first: batter takes second
          bases[1] = curBatter;
        }
      }
      else{ // Use defense
        if(bases[2] != -1){ // runner on third scores
          score++;
          bases[2] = -1;
        }
        if(bases[1] != -1){ // runner on second goes to third, then tries for home
          bases[2] = bases[1];
          bases[1] = -1;
          if(roll() + outfield > batters[bases[2]]["sp"] + 5){
            bases[2] = -1;
            outs++;
          }
          else{
            bases[2] = -1;
            score++;
          }
        }
        if(bases[0] != -1){ // runner on first goes to second, batter goes to first
          bases[1] = bases[0];
          bases[0] = curBatter;
        }else{ // no runner on first: batter takes second
          bases[1] = curBatter;
        }
      }
    }
    
    // Move runners from a double
    function result_2b(){
      if(!useDefense){
        if(bases[2] != -1){ // runner on third scores
          score++;
          bases[2] = -1;
        }
        if(bases[1] != -1){ // runner on second scores
          score++;
          bases[1] = -1;
        }
        if(bases[0] != -1){ // runner goes first to third
          bases[2] = bases[0];
          bases[0] = -1;
        }
        bases[1] = curBatter; // batter stands on second
      }
      else{ // Use defense
        if(bases[2] != -1){ // runner on third scores
          score++;
          bases[2] = -1;
        }
        if(bases[1] != -1){ // runner on second scores
          score++;
          bases[1] = -1;
        }
        if(bases[0] != -1){ // runner goes first to third, and tries to score
          bases[2] = bases[0];
          bases[0] = -1;
          if(roll() + outfield > batters[bases[2]]["sp"] + 5){
            bases[2] = -1;
            outs++;
          }
          else{
            bases[2] = -1;
            score++;
          }
        }
        bases[1] = curBatter; // batter stands on second
      }
    }
    
    // Move runners on triple
    function result_3b(){
      // No difference with defence
      if(bases[0] != -1){ // everybody scores!
        score++;
        bases[0] = -1;
      }
      if(bases[1] != -1){
        score++;
        bases[1] = -1;
      }
      if(bases[2] != -1){
        score++;
        bases[2] = -1;
      }
      bases[2] = curBatter; // and the batter stands on third
    }
    
    // Move runners on a hr
    function result_hr(){
      if(bases[0] != -1){ // everybody scores!
        score++;
        bases[0] = -1;
      }
      if(bases[1] != -1){
        score++;
        bases[1] = -1;
      }
      if(bases[2] != -1){
        score++;
        bases[2] = -1;
      }
      score++;
    }

    // Ubiquitous!
    function roll(){
      return Math.ceil(Math.random() * 20);
    }

    function logResult(){
      //console.log(abres);
      pitcherTallies[0][0][pitMap[abres]]++;
      batterTallies[curBatter][0][batMap[abres]]++;
    }
    
    // build 'results'
    // results has 11 items:
    // The first 9 are batters, then pitcher, then score
    function transformRawResultsToStatistics(){
      var r = new Array();
      // Access a specific raw value with batterTallies[batterIndex][0][resultOfAtbat]
      // Compute each (resultOfAtbat/Plate Appearances), as well as OBP
      
      //Batters
      for (var i = 0; i < batterTallies.length; i++) {
        var PA = batterTallies[i][0].reduce(function(a, b) {return a + b;});
       // remember PU are eaten up by FB
        r.push({"SO/PA": batterTallies[i][0][batMap["so"]] / PA, 
        "GB/PA": batterTallies[i][0][batMap["gb"]] / PA, 
        "FB/PA": batterTallies[i][0][batMap["fb"]] / PA, 
        "BB/PA": batterTallies[i][0][batMap["bb"]] / PA, 
        "1B/PA": batterTallies[i][0][batMap["1b"]] / PA, 
        "1B+/PA": batterTallies[i][0][batMap["1b+"]] / PA, 
        "2B/PA": batterTallies[i][0][batMap["2b"]] / PA, 
        "3B/PA": batterTallies[i][0][batMap["3b"]] / PA, 
        "HR/PA": batterTallies[i][0][batMap["hr"]] / PA, 
        "OBP": (batterTallies[i][0][batMap["bb"]] + batterTallies[i][0][batMap["1b"]] + batterTallies[i][0][batMap["1b+"]] + batterTallies[i][0][batMap["2b"]] + batterTallies[i][0][batMap["3b"]] + batterTallies[i][0][batMap["hr"]]) / PA
        });
      }
      //Pitchers
      for (var i = 0; i < pitcherTallies.length; i++) {
        // remember 1B+ and 3B are eaten up by 1B and 3B
        var PA = pitcherTallies[i][0].reduce(function(a, b) {return a + b;});
         // remember PU are eaten up by FB
        r.push({"PU/PA": pitcherTallies[i][0][pitMap["pu"]] / PA,
        "SO/PA": pitcherTallies[i][0][pitMap["so"]] / PA, 
        "GB/PA": pitcherTallies[i][0][pitMap["gb"]] / PA, 
        "FB/PA": pitcherTallies[i][0][pitMap["fb"]] / PA, 
        "BB/PA": pitcherTallies[i][0][pitMap["bb"]] / PA, 
        "1B/PA": pitcherTallies[i][0][pitMap["1b"]] / PA,
        "2B/PA": pitcherTallies[i][0][pitMap["2b"]] / PA, 
        "HR/PA": pitcherTallies[i][0][pitMap["hr"]] / PA, 
        "OBP": (pitcherTallies[i][0][pitMap["bb"]] + pitcherTallies[i][0][pitMap["1b"]] + pitcherTallies[i][0][pitMap["2b"]] + pitcherTallies[i][0][pitMap["hr"]]) / PA
        });
      }
      
      // Score
      r.push({"Score" : score});
      return r;
    }
    
    // Take temp and average all the values over number of simulation runs
    // At this point temp contains:
    //       temp[simNumber][batterNo,pitcher,score][each value]
    // n^3...ugh
    function averageResults(nineBatters){
      // Initialize an array
      // var r = zeros([batters.length,batters[0][0].length]);
      // function zeros(dim){
        // var array = [];
        // for (var i = 0; i < dim[0]; ++i) {
          // array.push(dim.length == 1 ? 0 : zeros(dim.slice(1)));
        // }
        // return array;
      // }
      var r = [];
      for (i = 0; i < batters.length; i++) {
        r.push({"SO/PA": 0,"GB/PA": 0,"FB/PA": 0,"BB/PA": 0,"1B/PA": 0,"1B+/PA": 0,"2B/PA": 0,"3B/PA": 0,"HR/PA": 0, "OBP": 0});
      }
      
      // Add up first...
      // for each of the simulation runs
      for (var i = 0; i < temp.length; i++) {
        // for each of the batters, pitcher, score, whatever is there
        for (var j = 0; j < 9; j++){// the first 9 are batters
          // for each of the attributes of said batter
          for (var k in temp[i][j]){
            // add the results from each of the simulations
            r[j][k] += temp[i][j][k];
          }
        }
      }
      
      // ...also the pitcher...
      r.push({"PU/PA": 0,"SO/PA": 0,"GB/PA": 0,"FB/PA": 0,"BB/PA": 0,"1B/PA": 0,"2B/PA": 0,"HR/PA": 0, "OBP": 0});
      // for each of the simulation runs
      for (var i = 0; i < temp.length; i++) {
        // for each of the attributes of the pitcher
        for (var k in temp[i][9]){
          // add the results from each of the simulations
          r[9][k] += temp[i][9][k];
        }
      }
      
     // ...also the score...
      r.push({"Score": 0});
      // for each of the simulation runs
      for (var i = 0; i < temp.length; i++) {
        // add the score
        r[10]["Score"] += temp[i][10]["Score"];
      }
      
      // ...and then divide to average...
      for (i = 0; i < r.length; i++){
        for (var j in r[i]){ //console.log(j);return r;
          r[i][j] /= sig;
        }
      }
      //console.log(temp);
      //console.log(r);
      return r;
    }
    
  }


});

// For node
//exports.sim = sim;