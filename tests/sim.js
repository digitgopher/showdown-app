define([
  'intern!object',
  'intern/chai!assert',
  'sim/sim'
], function (registerSuite, assert, sim) {
    registerSuite({
      name: 'sim',

      roll: function () {
        var x = [];
        var trials = 10000;
        for (var i = 0; i < trials; i++) {
          x.push(sim.roll());
          // Check that every roll is valid
          assert(x[i] <= 20, 'Roll is less than or equal to 20.');
          assert(x[i] >= 1, 'Roll is less than or equal to 20.');
        }
        var counts = {};
        for(var i = 0; i < x.length; i++) {
          var num = x[i];
          counts[num] = counts[num] ? counts[num]+1 : 1;
        }
        for(var i = 1; i <= counts.length; i++) {
          // Make sure that every valid number was produced
          assert(counts[i] > trials * .02, 'At least some rolls of '+ i +' should exist');
        }
        
        // Expect a uniform distribution: use Pearson's chi-square test for a distribution fit.
        var expected = trials / 20;
        var chiSquare = 0;
        for (var i = 1; i <= 20; i++) {
          chiSquare += (counts[i] - expected) * (counts[i] - expected) / expected;
        }
        // Chi-square statistics: p-value = 0.05, df = 19, limit = 30.144
        assert(chiSquare < 30.144, 'Chi-square test for roll uniform distribution failed at p-value = .05');
        // Chi-square statistics: p-value = 0.01, df = 19, limit = 36.191
        assert(chiSquare < 36.191, 'Chi-square test for roll uniform distribution failed at p-value = .01');
      },
      
      defenseThrow: function(){
        // defenseThrow(totalDefenseValue, totalSpeedValue), returns true when runner is thrown out
        assert.isTrue(sim.defenseThrow(8, 9), "Fielding check 1");
        assert.isTrue(sim.defenseThrow(8, 7), "Fielding check 2");
        assert.isFalse(sim.defenseThrow(2, 23), "Fielding check 3");
        assert.isFalse(sim.defenseThrow(3, 23), "Fielding check 4");
      },
      
      result_bb: function () {
        var r;
        r = sim.result_bb(0, 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'Walk with bases empty, score stays the same');
        assert.strictEqual(r[1], 15, 'Walk with bases empty, runner on first');
        assert.strictEqual(r[2], -1, 'Walk with bases empty, second empty');
        assert.strictEqual(r[3], -1, 'Walk with bases empty, third empty');
        assert.strictEqual(r[4], 0, 'Walk with bases empty, outs stay the same');
        
        r = sim.result_bb(0, 18, [5,15,10,22,0])
        assert.strictEqual(r[0], 6, 'Walk with bases full, score increases by one');
        assert.strictEqual(r[1], 18, 'Walk with bases full, batter on first');
        assert.strictEqual(r[2], 15, 'Walk with bases full, runner from first to second');
        assert.strictEqual(r[3], 10, 'Walk with bases full, runner from second to third');
        assert.strictEqual(r[4], 0, 'Walk with bases full, outs stay the same');
        
        r = sim.result_bb([5,5,5], 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'Walk with bases empty, score stays the same');
        assert.strictEqual(r[1], 15, 'Walk with bases empty, runner on first');
        assert.strictEqual(r[2], -1, 'Walk with bases empty, second empty');
        assert.strictEqual(r[3], -1, 'Walk with bases empty, third empty');
        assert.strictEqual(r[4], 0, 'Walk with bases empty, outs stay the same');
        
        r = sim.result_bb([5,5,5], 18, [5,15,10,22,0])
        assert.strictEqual(r[0], 6, 'Walk with bases full, score increases by one');
        assert.strictEqual(r[1], 18, 'Walk with bases full, batter on first');
        assert.strictEqual(r[2], 15, 'Walk with bases full, runner from first to second');
        assert.strictEqual(r[3], 10, 'Walk with bases full, runner from second to third');
        assert.strictEqual(r[4], 0, 'Walk with bases full, outs stay the same');
      },
      
      result_1b: function () {
        var r;
        r = sim.result_1b(0, 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'Single with bases empty, score stays the same');
        assert.strictEqual(r[1], 15, 'Single with bases empty, runner on first');
        assert.strictEqual(r[2], -1, 'single with bases empty, second vacant');
        assert.strictEqual(r[3], -1, 'single with bases empty, third vacant');
        assert.strictEqual(r[4], 0, 'single with bases empty, outs stay the same');
        
        r = sim.result_1b(0, 18, [5,-1,10,22,0]);
        assert.strictEqual(r[0], 6, 'Single with runners on second and third, score');
        assert.strictEqual(r[1], 18, 'Single with runners on second and third, first');
        assert.strictEqual(r[2], -1, 'Single with runners on second and third, second');
        assert.strictEqual(r[3], 10, 'Single with runners on second and third, third');
        assert.strictEqual(r[4], 0, 'Single with runners on second and third, outs');
        
        r = sim.result_1b(0, 18, [5,22,-1,-1,0]);
        assert.strictEqual(r[0], 5, 'Single with runner on first, score');
        assert.strictEqual(r[1], 18, 'Single with runner on first, first');
        assert.strictEqual(r[2], 22, 'Single with runner on first, second');
        assert.strictEqual(r[3], -1, 'Single with runner on first, third');
        assert.strictEqual(r[4], 0, 'Single with runner on first, outs');
        
        r = sim.result_1b(0, 18, [5,15,10,22,0]);
        assert.strictEqual(r[0], 6, 'Single with bases loaded; score');
        assert.strictEqual(r[1], 18, 'Single with bases loaded; first');
        assert.strictEqual(r[2], 15, 'Single with bases loaded; second');
        assert.strictEqual(r[3], 10, 'Single with bases loaded; third');
        assert.strictEqual(r[4], 0, 'Single with bases loaded; outs');
        
        r = sim.result_1b([5,5,5], 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'dSingle with bases empty, score stays the same');
        assert.strictEqual(r[1], 15, 'dSingle with bases empty, runner on first');
        assert.strictEqual(r[2], -1, 'dsingle with bases empty, second vacant');
        assert.strictEqual(r[3], -1, 'dsingle with bases empty, third vacant');
        assert.strictEqual(r[4], 0, 'dsingle with bases empty, outs stay the same');
        
        for (var i = 0; i < 100; i++) {
          r = sim.result_1b([5,5,5], 18, [5,-1,10,22,0]);
          assert.strictEqual(r[1], 18, 'dSingle with runners on second and third; always same runner on first');
          assert.strictEqual(r[2], -1, 'dSingle with runners on second and third; second always empty');
          assert.strictEqual(r[3], -1, 'dSingle with runners on second and third; third always empty');
          if(r[0] === 6){
            assert.strictEqual(r[4], 1, 'dSingle with runners on second and third, outs');
          }
          else if(r[0] === 7){
            assert.strictEqual(r[4], 0, 'dSingle with runners on second and third, outs');
          }
          else {
            assert.ok(false, 'dSingle with runners on second and third; score should be one of two strict values')
          }
        }
        
        r = sim.result_1b([5,5,5], 18, [5,22,-1,-1,0]);
        assert.strictEqual(r[0], 5, 'dSingle with runner on first, score');
        assert.strictEqual(r[1], 18, 'dSingle with runner on first, first');
        assert.strictEqual(r[2], 22, 'dSingle with runner on first, second');
        assert.strictEqual(r[3], -1, 'dSingle with runner on first, third');
        assert.strictEqual(r[4], 0, 'dSingle with runner on first, outs');
        
        for (var i = 0; i < 100; i++) {
          r = sim.result_1b([5,5,5], 18, [5,15,10,22,0]);
          assert.strictEqual(r[1], 18, 'Using defense; Single with runners on second and third; always same runner on first');
          assert.strictEqual(r[2], 15, 'Using defense; Single with runners on second and third; second always contains runner from first');
          assert.strictEqual(r[3], -1, 'Using defense; Single with runners on second and third; third always empty');
          if(r[0] === 6){
            assert.strictEqual(r[4], 1, 'Using defense; Single with runners on second and third; if one run scores than than one runner was thrown out at the plate');
          }
          else if(r[0] === 7){
            assert.strictEqual(r[4], 0, 'Using defense; Single with runners on second and third; if 2 runs score then no outs made');
          }
          else {
            assert.ok(false, 'Using defense; Single with runners on second and third; score should be one of two strict values')
          }
        }
      },
      
      result_1bplus: function () {
        assert.strictEqual(sim.result_1bplus(false, 15, [0,-1,-1,-1])[0], 0, 'Single plus with bases empty, score stays the same');
        assert.strictEqual(sim.result_1bplus(false, 15, [0,-1,-1,-1])[1], -1, 'Bases empty');
        assert.strictEqual(sim.result_1bplus(false, 15, [0,-1,-1,-1])[2], 15, 'Bases empty');
        assert.strictEqual(sim.result_1bplus(false, 15, [0,-1,-1,-1])[3], -1, 'Bases empty');
        
        assert.strictEqual(sim.result_1bplus(false, 18, [5,-1,10,22])[0], 6, 'Single plus with runners on second and third.');
        assert.strictEqual(sim.result_1bplus(false, 18, [5,-1,10,22])[1], -1, 'full');
        assert.strictEqual(sim.result_1bplus(false, 18, [5,-1,10,22])[2], 18, 'full');
        assert.strictEqual(sim.result_1bplus(false, 18, [5,-1,10,22])[3], 10, 'full');
        
        assert.strictEqual(sim.result_1bplus(false, 18, [5,22,-1,-1])[0], 5, 'Single plus with runner on first.');
        assert.strictEqual(sim.result_1bplus(false, 18, [5,22,-1,-1])[1], 18, 'full');
        assert.strictEqual(sim.result_1bplus(false, 18, [5,22,-1,-1])[2], 22, 'full');
        assert.strictEqual(sim.result_1bplus(false, 18, [5,22,-1,-1])[3], -1, 'full');
        
        assert.strictEqual(sim.result_1bplus(false, 18, [5,15,10,22])[0], 6, 'full');
        assert.strictEqual(sim.result_1bplus(false, 18, [5,15,10,22])[1], 18, 'full');
        assert.strictEqual(sim.result_1bplus(false, 18, [5,15,10,22])[2], 15, 'full');
        assert.strictEqual(sim.result_1bplus(false, 18, [5,15,10,22])[3], 10, 'full');
      },
      
      result_2b: function () {
        assert.strictEqual(sim.result_2b(false, 15, [0,-1,-1,-1])[0], 0, 'Double with bases empty, score stays the same');
        assert.strictEqual(sim.result_2b(false, 15, [0,-1,-1,-1])[1], -1, 'Bases empty');
        assert.strictEqual(sim.result_2b(false, 15, [0,-1,-1,-1])[2], 15, 'Bases empty');
        assert.strictEqual(sim.result_2b(false, 15, [0,-1,-1,-1])[3], -1, 'Bases empty');
        
        assert.strictEqual(sim.result_2b(false, 18, [5,-1,10,22])[0], 7, 'Double with runners on second and third.');
        assert.strictEqual(sim.result_2b(false, 18, [5,-1,10,22])[1], -1, 'full');
        assert.strictEqual(sim.result_2b(false, 18, [5,-1,10,22])[2], 18, 'full');
        assert.strictEqual(sim.result_2b(false, 18, [5,-1,10,22])[3], -1, 'full');
        
        assert.strictEqual(sim.result_2b(false, 18, [5,22,-1,-1])[0], 5, 'Double with runner on first.');
        assert.strictEqual(sim.result_2b(false, 18, [5,22,-1,-1])[1], -1, 'full');
        assert.strictEqual(sim.result_2b(false, 18, [5,22,-1,-1])[2], 18, 'full');
        assert.strictEqual(sim.result_2b(false, 18, [5,22,-1,-1])[3], 22, 'full');
        
        assert.strictEqual(sim.result_2b(false, 18, [5,15,10,22])[0], 7, 'full');
        assert.strictEqual(sim.result_2b(false, 18, [5,15,10,22])[1], -1, 'full');
        assert.strictEqual(sim.result_2b(false, 18, [5,15,10,22])[2], 18, 'full');
        assert.strictEqual(sim.result_2b(false, 18, [5,15,10,22])[3], 15, 'full');
      },
      
      result_3b: function () {
        assert.strictEqual(sim.result_3b(false, 15, [0,-1,-1,-1])[0], 0, 'Triple with bases empty, score stays the same');
        assert.strictEqual(sim.result_3b(false, 15, [0,-1,-1,-1])[1], -1, 'Bases empty');
        assert.strictEqual(sim.result_3b(false, 15, [0,-1,-1,-1])[2], -1, 'Bases empty');
        assert.strictEqual(sim.result_3b(false, 15, [0,-1,-1,-1])[3], 15, 'Bases empty');
        
        assert.strictEqual(sim.result_3b(false, 18, [5,-1,10,22])[0], 7, 'Triple with runners on second and third.');
        assert.strictEqual(sim.result_3b(false, 18, [5,-1,10,22])[1], -1, 'full');
        assert.strictEqual(sim.result_3b(false, 18, [5,-1,10,22])[2], -1, 'full');
        assert.strictEqual(sim.result_3b(false, 18, [5,-1,10,22])[3], 18, 'full');
        
        assert.strictEqual(sim.result_3b(false, 18, [5,22,-1,-1])[0], 6, 'Triple with runner on first.');
        assert.strictEqual(sim.result_3b(false, 18, [5,22,-1,-1])[1], -1, 'full');
        assert.strictEqual(sim.result_3b(false, 18, [5,22,-1,-1])[2], -1, 'full');
        assert.strictEqual(sim.result_3b(false, 18, [5,22,-1,-1])[3], 18, 'full');
        
        assert.strictEqual(sim.result_3b(false, 18, [5,15,10,22])[0], 8, 'Triple');
        assert.strictEqual(sim.result_3b(false, 18, [5,15,10,22])[1], -1, 'full');
        assert.strictEqual(sim.result_3b(false, 18, [5,15,10,22])[2], -1, 'full');
        assert.strictEqual(sim.result_3b(false, 18, [5,15,10,22])[3], 18, 'full');
      },
      
      result_hr: function () {
        assert.strictEqual(sim.result_hr(false, 15, [0,-1,-1,-1])[0], 1, 'HR with bases empty, score stays the same');
        assert.strictEqual(sim.result_hr(false, 15, [0,-1,-1,-1])[1], -1, 'Bases empty');
        assert.strictEqual(sim.result_hr(false, 15, [0,-1,-1,-1])[2], -1, 'Bases empty');
        assert.strictEqual(sim.result_hr(false, 15, [0,-1,-1,-1])[3], -1, 'Bases empty');
        
        assert.strictEqual(sim.result_hr(false, 18, [5,-1,10,22])[0], 8, 'HR with runners on second and third.');
        assert.strictEqual(sim.result_hr(false, 18, [5,-1,10,22])[1], -1, 'full');
        assert.strictEqual(sim.result_hr(false, 18, [5,-1,10,22])[2], -1, 'full');
        assert.strictEqual(sim.result_hr(false, 18, [5,-1,10,22])[3], -1, 'full');
        
        assert.strictEqual(sim.result_hr(false, 18, [5,22,-1,-1])[0], 7, 'HR with runner on first.');
        assert.strictEqual(sim.result_hr(false, 18, [5,22,-1,-1])[1], -1, 'full');
        assert.strictEqual(sim.result_hr(false, 18, [5,22,-1,-1])[2], -1, 'full');
        assert.strictEqual(sim.result_hr(false, 18, [5,22,-1,-1])[3], -1, 'full');
        
        assert.strictEqual(sim.result_hr(false, 18, [5,15,10,22])[0], 9, 'HR');
        assert.strictEqual(sim.result_hr(false, 18, [5,15,10,22])[1], -1, 'full');
        assert.strictEqual(sim.result_hr(false, 18, [5,15,10,22])[2], -1, 'full');
        assert.strictEqual(sim.result_hr(false, 18, [5,15,10,22])[3], -1, 'full');
      }
    });
});