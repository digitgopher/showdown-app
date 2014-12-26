define([
  'intern!object',
  'intern/chai!assert',
  'sim/simrun'
], function (registerSuite, assert, sim) {
    registerSuite({
      name: 'sim',

      roll: function () {
        //var x = sim.roll();
        assert(sim.roll() <= 20, 'Roll is less than or equal to 20.');
      }
    });
});