requirejs.config({
    //By default load any module IDs from baseUrl
    baseUrl: 'lib',
    //except, if the module ID starts with "app", "sim", etc
    //paths config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        sim: '../sim',
        jquery: 'jquery-1.11.1.min',
        chosen: 'chosen_v1.4.2/chosen.jquery.min',
        pitcherData: '../data/showdown-pitchers.min',
        batterData: '../data/showdown-batters.min'
    },
    shim: {
      'chosen': [ 'jquery' ]
    }
});

// Start the main app logic.
requirejs([
  'jquery',
  'chosen',
  'sim/validate',
  'sim/run',
  'sim/sim',
  'pitcherData',
  'batterData',
  'sim/view-controller',
  'sim/data'
  ],
function  ($, chosen, validate, run, sim, p, b, vc, d) {
  //jQuery, sim loaded and can be used here now.
});