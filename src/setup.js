requirejs.config({
    //By default load any module IDs from baseUrl
    baseUrl: 'lib',
    //except, if the module ID starts with "app", "sim", etc
    //paths config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        src: '../src',
        d3: 'd3.v3.min',
        jquery: 'jquery-1.11.3.min',
        chosen: 'chosen_v1.4.2/chosen.jquery.min',
        pitcherData: '../data/showdown-pitchers.min',
        batterData: '../data/showdown-batters.min',
        data: '../data'
    },
    shim: {
      'chosen': [ 'jquery' ]
    }
});

// Start the main app logic.
requirejs([
  'src/view-controller',
  'src/vis-circle-packing'
  ],
function  (vc, cp) {
  // modules loaded and can be used here now.
});