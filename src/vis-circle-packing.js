define(["jquery", "d3"], function($, d3) {


var hierarchy,
    bData,
    pData,
    nodes,
    masterCircle,
    text1, // using 2 as a hack for 2 lines of text, since wrapping in a circle is hard.
    text2,
    view, // magic. Actually set in zoomTo.
    curVal1 = $("[name='option1']:checked").val(),
    curVal2 = $("[name='option2']:checked").val(),
    curVal3 = $("[name='coloring']:checked").val(),
    colorBins = ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"];
    
var domains = {
  "b_obp": [.180, .480],
  "p_obp": [.480, .180],
  "ob": [4, 11],
  "c": [0, 6],
  "bOuts": [1, 9],
  "pOuts": [11, 19],
  "pu": [0, 4],
  "b_so": [0, 5],
  "p_so": [0, 10],
  "b_gb": [0, 5],
  "p_gb": [0, 10],
  "b_fb": [0, 5],
  "p_fb": [0, 10],
  "b_bb": [0, 10],
  "p_bb": [0, 4],
  "b_b1": [0, 14],
  "p_b1": [0, 4],
  "b1p": [0, 4],
  "b_b2": [0, 5],
  "p_b2": [0, 2],
  "b3": [0, 5],
  "b_hr": [0, 5],
  "p_hr": [0, 2],
  "pt": [10, 650],
  "ip": [4, 9],
  "sp": [8,23]
};

// Initial selections
var selectedYears = [];
$("input:checkbox[name=years]:checked").each(function() { selectedYears.push($(this).val()); });
$(".pit").hide();


var margin = 10,
    diameter = 1000;

var circleColor = d3.scale./*category10();*/linear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);
    
var cardColor = d3.scale.quantile() // scale quantize doesn't have a .quantiles() function
    .domain(domains[curVal3])
    .range(colorBins);

updateLegend();

var pack = d3.layout.pack()
    .padding(2)
    .size([diameter - margin, diameter - margin])
    //.sort(function(a,b) { return a.value - b.value; })
    // Not using size as a dimension right now
    .value(function(d) { return d.hasOwnProperty("bb") ? 1 : 1; })

// Add the svg canvas
var svg = d3.select("#circle-packing-container").append("svg")
    .attr("viewBox","0 0 1000 1000")
    .attr("perserveAspectRatio","xMinYMid")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubbleFrame")
  .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

// Initialize pitcher data
d3.csv("data/pitchers.csv",
  function(d) {
    return {
      p_obp: 0,
      
      nm: d.Name,
      yr: d.year,
      st: d.set,
      cn: +d.cardNo, // + converts to number
      tm: d.team,
      c: +d.control,
      pu: +d.pu,
      p_so: +d.so,
      p_gb: +d.gb,
      p_fb: +d.fb,
      pOuts: +d.pu + +d.so + +d.gb + +d.fb,
      p_bb: +d.bb,
      p_b1: +d.b1 > 20 ? 0 : +d.b1,
      p_b2: +d.b2 > 20 ? 0 : +d.b2,
      p_hr: +d.hr > 20 ? 0 : +d.hr,
      pt: +d.pts,
      ip: +d.ip,
      hd: d.hand,
      pos: d.pos
    };
  },
  function(error, root) {
    pData = root; // data set and doesn't change.
  }
);

// Initialize batter data
d3.csv("data/batters.csv",
  function(d) {
    return {
      b_obp: 0,

      nm: d.Name,
      yr: d.year,
      st: d.set,
      cn: +d.cardNo, // + converts to number
      tm: d.team,
      ob: +d.onbase,
      b_so: +d.so,
      b_gb: +d.gb,
      b_fb: +d.fb,
      bOuts: +d.so + +d.gb + +d.fb,
      b_bb: +d.bb,
      b_b1: +d.b1,
      b1p: +d.b1p,
      b_b2: +d.b2 > 20 ? 0 : +d.b2,
      b3: +d.b3 > 20 ? 0 : +d.b3,
      b_hr: +d.hr > 20 ? 0 : +d.hr,
      pt: +d.pts,
      sp: +d.sp,
      hd: d.hand,
      p1: d.pos1,
      f1: +d.fld1,
      p2: d.pos2,
      f2: +d.fld2,
      p3: d.pos3,
      f3: +d.fld3,
      p4: d.pos4,
      f4: +d.fld4
    };
  },
  function(error, root) {
    bData = root; // data set and doesn't change.
    computeStatistics();
    refreshScreen();

    d3.select("#circle-packing-container")
      .on("click", function() { zoom(hierarchy); });

    zoomTo([hierarchy.x, hierarchy.y, hierarchy.r * 2 + margin]);
  }
);

/*
Take raw csv data and transform it into a json hierarchy based on given sort values.
*/
function computeHierarchy(){
  var dataset = $("[name='dataset']:checked").val();
  var data = dataset == "b" ? bData : pData;
  hierarchy = data.filter(function(d) { return selectedYears.indexOf(d.yr) > -1});

  var element1, element2, newRoot, build;
  var players = {"name": "players", "children": []};
  
  // Obtain selected attributes' max/min values.
  var extent1 = d3.extent(hierarchy, function(d) { return d[curVal1]; });
  var extent2 = d3.extent(hierarchy, function(d) { return d[curVal2]; });
  
  // Build the data json
  //
  // Algorithm time:
  // const * const * 2 * O(n)
  // Also note that with points, we can skip every 10 values.
  
  for(var i = extent1[0]; i <= extent1[1]; curVal1 == "pt" ? i+=10 : i++){ // constant time
    element1 = {[curVal1]: i, "children": []};
    for(var j = extent2[0]; j <= extent2[1]; curVal2 == "pt" ? j+=10 : j++){ // constant time
      element2 = {[curVal2]: j, "children": []};
      
      found = [];
      newRoot = [];
      hierarchy.map(function(val){ // O(n)
        if(val[curVal1] == i && val[curVal2] == j){
          found.push(val);
        }
        else newRoot.push(val);
      });
      
      // add each found item
      found.map(function(val){ // O(n)
        element2.children.push(val);
      });
      
      hierarchy = newRoot;
      
      if(element2.children.length > 0) element1.children.push(element2);
    }
    
    players.children.push(element1);
  }
  // The results!
  //$(".d").html('<pre>'+JSON.stringify(players, null, '  ')+'</pre>');

  hierarchy = players;
}

/* Compute attributes that change based on data years selected

OBP = chance of batters chart * chance of getting that result on batters chart + chance of pitchers chart * chance of getting that result on pitchers chart
OBP = ($OB-$pC)/20*$numWaysToGetOnbaseOnBattersChart/20 + (20-($OB-$pC))/20*numWaysToGetOnbaseOnPitchersChart/20

Todo: SLG
*/
function computeStatistics() {
  var dataset = $("[name='dataset']:checked").val();
  var selectedOposition;
  var avgs;

  if(dataset == "b") {
    avgs = {"c": 0, "pOuts": 0, "p_bb": 0, "p_b1": 0, "p_b2": 0, "p_hr": 0};
    selectedOposition = pData.filter(function(d) { return selectedYears.indexOf(d.yr) > -1});
  
    // Sum all.
    for(var i = 0; i < selectedOposition.length; i++) {
      for(var j in avgs) {
        avgs[j] += selectedOposition[i][j];
      }
    }
    // And then average them.
    for(var j in avgs) {
      avgs[j] /= selectedOposition.length;
    }
    // Set each value.
    bData.map(function(d) {
      d.b_obp = (d.ob - avgs.c) / 20 * (d.b_bb + d.b_b1 + d.b1p + d.b_b2 + d.b3 + d.b_hr) / 20 + (20 - (d.ob - avgs.c)) / 20 * (avgs.p_bb + avgs.p_b1 + avgs.p_b2 + avgs.p_hr) / 20;
    });
  }
  else {
    avgs = {"ob": 0, "bOuts": 0, "b_bb": 0, "b_b1": 0, "b1p": 0, "b_b2": 0, "b3": 0, "b_hr": 0};
    selectedOposition = bData.filter(function(d) { return selectedYears.indexOf(d.yr) > -1});
    
    // Sum all.
    for(var i = 0; i < selectedOposition.length; i++) {
      for(var j in avgs) {
        avgs[j] += selectedOposition[i][j];
      }
    }
    // And then average them.
    for(var j in avgs) {
      avgs[j] /= selectedOposition.length;
    }
    // Set each value.
    pData.map(function(d) {
      d.p_obp = (avgs.ob - d.c) / 20 * (avgs.b_bb + avgs.b_b1 + avgs.b1p + avgs.b_b2 + avgs.b3 + avgs.b_hr) / 20 + (20 - (avgs.ob - d.c)) / 20 * (d.p_bb + d.p_b1 + d.p_b2 + d.p_hr) / 20;
    });
  }
}

function reset(){
  $("svg > g").empty();
}

function rePack(){
  nodes = pack.nodes(hierarchy);
}

function updateDisplay(){
  masterCircle = svg.selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("class", getClass)
      .style("fill", function(d) { return d.children ? circleColor(d.depth) : cardColor(d[curVal3]); })
      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

  text1 = svg.selectAll("text1")
      .data(nodes)
    .enter().append("text")
      .attr("class", getClass)
      .attr("text-anchor", "middle")
      .attr('dy', '0.35em')
      .style("display", function(d) { return d.parent === hierarchy ? null : "none"; })
      .text(function(d) { return appropriateName(d, 1); });
  text2 = svg.selectAll("text2")
      .data(nodes)
    .enter().append("text")
      .attr("class", "small-text")
      .attr("text-anchor", "middle")
      .attr('dy', '1.5em')
      .style("display", function(d) { return d.parent === hierarchy ? null : "none"; })
      .text(function(d) { return appropriateName(d, 2); });
}

function updateLegend() {
  //console.log(cardColor.quantiles());
  var q = cardColor.quantiles().map(round);
  $("#lcb6").text(q[0] + " or less");
  $("#lcb5").text(q[0] + " - " + q[1]);
  $("#lcb4").text(q[1] + " - " + q[2]);
  $("#lcb3").text(q[2] + " - " + q[3]);
  $("#lcb2").text(q[3] + " - " + q[4]);
  $("#lcb1").text(q[4] + " or more");
  
  function round(d) {
    if (curVal3.indexOf("obp") > -1) {
      return d.toFixed(3);
    }
    else if (curVal3 == "pt") {
      return Number(d.toPrecision(2));
    }
    else if (curVal3 == "ob") {
      return d.toFixed();
    }
    else {
      return Math.round(d*100)/100;
    }
  }
}

function appropriateName(d, row){
  if(d.depth == 1 && row == 1) return d[curVal1]; // First level circle
  if(d.depth == 2 && row == 1) return d[curVal2]; // Second level circle
  if(d.depth == 3) {  // leaf
    if(row == 1) return d.nm;
    if(row == 2) return "(" + d.st + " " + d.yr + " " + d.tm + ")";
  }
  return "";
}

function getClass(circle) {
  if(!circle.parent) return "node node--root";
  if(circle.depth == 1) return "node node--1";
  if(circle.depth == 2) return "node node--2";
  if(circle.depth == 3) return "node node--leaf";
  return "";
}

function zoom(d) {
  var focus0 = focus; focus = d;

  var transition = d3.transition()
    .duration(d3.event.altKey ? 7500 : 750)
    .tween("zoom", function(d) {
      var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
      return function(t) { zoomTo(i(t)); };
    });

  transition.selectAll("text")
    .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
    .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
    .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
    .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}

function zoomTo(v) {
  var node = svg.selectAll("circle,text");
  var k = diameter / v[2]; view = v;
  node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
  masterCircle.attr("r", function(d) { return d.r * k; });
  //node.style("display", null );
}

function getNumChildLeaves(node) {
  var i = 0;
  function recurse(node) {
    node.children ? node.children.forEach(function(child) { recurse(child); }) : i++; // increment when a leaf!
  }
  recurse(node);
  return i;
}

d3.select(self.frameElement).style("height", diameter + "px");

// Make responsive!
var chart = $(".bubbleFrame"),
    aspect = chart.width() / chart.height(),
    container = chart.parent();
$(window).on("resize", function() {
    var targetWidth = container.width();
    if(targetWidth < diameter){
      chart.attr("width", targetWidth);
      chart.attr("height", Math.round(targetWidth / aspect));
    }
}).trigger("resize");

function setLegend(){
  
}

//*******************
// Event handlers
//*******************

function refreshScreen() {
  computeHierarchy();
  reset();
  rePack();
  updateDisplay();
}

// Change dimensions from user input.
$(":radio[name*='option']").change(function(){
  curVal1 = $("[name='option1']:checked").val();
  curVal2 = $("[name='option2']:checked").val();
  refreshScreen();
});

// Change coloring attribute from user input.
$(":radio[name='coloring']").change(function(){
  curVal3 = $("[name='coloring']:checked").val();
  cardColor.domain(domains[curVal3]);
  updateLegend();
  reset();
  updateDisplay();
});

// Filter data from user input. (years)
$("input:checkbox[name=years]").change(function(){
  var v = $(this).val();
  if($(this).is(":checked")) {
    selectedYears.push(v); // add the newly selected year
  }
  else {
    var index = selectedYears.indexOf(v);
    selectedYears.splice(index, 1); // remove the unselected year
  }
  computeStatistics();
  refreshScreen();
});

// Change dataset visualized (batters or pitchers)
$(":radio[name='dataset']").change(function(){
  updateOptions();
  curVal1 = $("[name='option1']:checked").val();
  curVal2 = $("[name='option2']:checked").val();
  curVal3 = $("[name='coloring']:checked").val();
  cardColor.domain(domains[curVal3]);
  updateLegend();
  computeStatistics();
  refreshScreen();
});

function updateOptions() {
  if($("[name='dataset']:checked").val() == "b") {
    $(".pit").hide();
    $(".bat").show();
    $(".bat-default").prop('checked', true);
  }
  else{
    $(".pit").show();
    $(".bat").hide();
    $(".pit-default").prop('checked', true);
  }
}



});