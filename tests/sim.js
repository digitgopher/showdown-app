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
        for (var i = 0; i < 100; i++) {
          // These should all happen every time!
          assert.isTrue(sim.defenseThrow(9, 9), "Fielding check 1");
          assert.isTrue(sim.defenseThrow(8, 7), "Fielding check 2");
          assert.isFalse(sim.defenseThrow(2, 23), "Fielding check 3");
          assert.isFalse(sim.defenseThrow(3, 23), "Fielding check 4");
        }
      },
      
      result_pu: function () {
        var r;
        r = sim.result_pu(0, 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'No Defense; Pop-up with bases empty, score stays the same');
        assert.strictEqual(r[1], -1, 'No Defense; Pop-up with bases empty, first empty');
        assert.strictEqual(r[2], -1, 'No Defense; Pop-up with bases empty, second empty');
        assert.strictEqual(r[3], -1, 'No Defense; Pop-up with bases empty, third empty');
        assert.strictEqual(r[4], 1, 'No Defense; Pop-up with bases empty, outs +1');
        
        r = sim.result_pu(0, 18, [5,15,10,22,0])
        assert.strictEqual(r[0], 5, 'No Defense; Pop-up with bases full, score same');
        assert.strictEqual(r[1], 15, 'No Defense; Pop-up with bases full, first holds');
        assert.strictEqual(r[2], 10, 'No Defense; Pop-up with bases full, second holds');
        assert.strictEqual(r[3], 22, 'No Defense; Pop-up with bases full, third holds');
        assert.strictEqual(r[4], 1, 'No Defense; Pop-up with bases full, outs +1');
        
        r = sim.result_pu([5,5,5], 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'Using Defense; Pop-up with bases empty, score stays the same');
        assert.strictEqual(r[1], -1, 'Using Defense; Pop-up with bases empty, first empty');
        assert.strictEqual(r[2], -1, 'Using Defense; Pop-up with bases empty, second empty');
        assert.strictEqual(r[3], -1, 'Using Defense; Pop-up with bases empty, third empty');
        assert.strictEqual(r[4], 1, 'Using Defense; Pop-up with bases empty, outs +1');
        
        r = sim.result_pu([5,5,5], 18, [5,15,10,22,0])
        assert.strictEqual(r[0], 5, 'Using Defense; Pop-up with bases full, score same');
        assert.strictEqual(r[1], 15, 'Using Defense; Pop-up with bases full, first holds');
        assert.strictEqual(r[2], 10, 'Using Defense; Pop-up with bases full, second holds');
        assert.strictEqual(r[3], 22, 'Using Defense; Pop-up with bases full, third holds');
        assert.strictEqual(r[4], 1, 'Using Defense; Pop-up with bases full, outs +1');
      },
      
      result_so: function () {
        var r;
        r = sim.result_so(0, 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'No Defense; Strikeout with bases empty, score stays the same');
        assert.strictEqual(r[1], -1, 'No Defense; Strikeout with bases empty, first empty');
        assert.strictEqual(r[2], -1, 'No Defense; Strikeout with bases empty, second empty');
        assert.strictEqual(r[3], -1, 'No Defense; Strikeout with bases empty, third empty');
        assert.strictEqual(r[4], 1, 'No Defense; Strikeout with bases empty, outs +1');
        
        r = sim.result_so(0, 18, [5,15,10,22,0])
        assert.strictEqual(r[0], 5, 'No Defense; Strikeout with bases full, score same');
        assert.strictEqual(r[1], 15, 'No Defense; Strikeout with bases full, first holds');
        assert.strictEqual(r[2], 10, 'No Defense; Strikeout with bases full, second holds');
        assert.strictEqual(r[3], 22, 'No Defense; Strikeout with bases full, third holds');
        assert.strictEqual(r[4], 1, 'No Defense; Strikeout with bases full, outs +1');
        
        r = sim.result_so([5,5,5], 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'Using Defense; Strikeout with bases empty, score stays the same');
        assert.strictEqual(r[1], -1, 'Using Defense; Strikeout with bases empty, first empty');
        assert.strictEqual(r[2], -1, 'Using Defense; Strikeout with bases empty, second empty');
        assert.strictEqual(r[3], -1, 'Using Defense; Strikeout with bases empty, third empty');
        assert.strictEqual(r[4], 1, 'Using Defense; Strikeout with bases empty, outs +1');
        
        r = sim.result_so([5,5,5], 18, [5,15,10,22,0])
        assert.strictEqual(r[0], 5, 'Using Defense; Strikeout with bases full, score same');
        assert.strictEqual(r[1], 15, 'Using Defense; Strikeout with bases full, first holds');
        assert.strictEqual(r[2], 10, 'Using Defense; Strikeout with bases full, second holds');
        assert.strictEqual(r[3], 22, 'Using Defense; Strikeout with bases full, third holds');
        assert.strictEqual(r[4], 1, 'Using Defense; Strikeout with bases full, outs +1');
      },
      
      result_gb: function () {
        var r;
        r = sim.result_gb(0, 15, [0,-1,-1,-1,0]);
        // 8 combinations of baserunners, 3 possibilities for number of outs (24 configurations)
        
        // Two outs (8 out of 24)
        // No runners on base, 0 or 1 outs
        // Runner on first only, 0 or 1 outs
        // Runner on second only, 0 or 1 outs
        // Runner on third only, 0 or 1 outs
        // Runner on first and second, 0 or 1 outs
        // Runner on first and third, 0 or 1 outs
        // Runner on second and third, 0 or 1 outs
        // Bases loaded, 0 or 1 outs
      },
      
      result_fb: function () {
        var r;
        r = sim.result_fb(0, 15, [0,-1,-1,-1,0]);
        // 8 combinations of baserunners, 3 possibilities for number of outs (24 configurations)
        
        // Two outs (8 out of 24)
        // No runners on base or runner on first only, 0 or 1 out (4 out of 24)
        // Runner on second only, 0 or 1 outs
        // Runner on third only, 0 or 1 outs
        // Runner on first and second, 0 or 1 outs
        // Runner on first and third, 0 or 1 outs
        // Runner on second and third, 0 or 1 outs
        // Bases loaded, 0 or 1 outs
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
          assert.strictEqual(r[1], 18, 'Using defense; Single with bases loaded; always same runner on first');
          assert.strictEqual(r[2], 15, 'Using defense; Single with bases loaded; second always contains runner from first');
          assert.strictEqual(r[3], -1, 'Using defense; Single with bases loaded; third always empty');
          if(r[0] === 6){
            assert.strictEqual(r[4], 1, 'Using defense; Single with bases loaded; if one run scores than than one runner was thrown out at the plate');
          }
          else if(r[0] === 7){
            assert.strictEqual(r[4], 0, 'Using defense; Single with bases loaded; if 2 runs score then no outs made');
          }
          else {
            assert.ok(false, 'Using defense; Single with bases loaded; score should be one of two strict values')
          }
        }
      },
      
      result_1bplus: function () {
        var r;
        r = sim.result_1bplus(0, 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'No Defense; Single plus with bases empty, score stays the same');
        assert.strictEqual(r[1], -1, 'No Defense; Single plus with bases empty, first vacant');
        assert.strictEqual(r[2], 15, 'No Defense; Single plus with bases empty, runner on second');
        assert.strictEqual(r[3], -1, 'No Defense; Single plus with bases empty, third vacant');
        assert.strictEqual(r[4], 0, 'No Defense; Single plus with bases empty, outs stay the same');
        
        r = sim.result_1bplus(0, 18, [5,-1,10,22,0]);
        assert.strictEqual(r[0], 6, 'No Defense; Single plus with runners on second and third, score +1');
        assert.strictEqual(r[1], -1, 'No Defense; Single plus with runners on second and third, first empty');
        assert.strictEqual(r[2], 18, 'No Defense; Single plus with runners on second and third, batter on second');
        assert.strictEqual(r[3], 10, 'No Defense; Single plus with runners on second and third, runner second to third');
        assert.strictEqual(r[4], 0, 'No Defense; Single plus with runners on second and third, outs stay the same');
        
        r = sim.result_1bplus(0, 18, [5,22,-1,-1,0]);
        assert.strictEqual(r[0], 5, 'No Defense; Single plus with runner on first, score same');
        assert.strictEqual(r[1], 18, 'No Defense; Single plus with runner on first, batter on first');
        assert.strictEqual(r[2], 22, 'No Defense; Single plus with runner on first, runner first to second');
        assert.strictEqual(r[3], -1, 'No Defense; Single plus with runner on first, third empty');
        assert.strictEqual(r[4], 0, 'No Defense; Single plus with runner on first, outs same');
        
        r = sim.result_1bplus(0, 18, [5,15,10,22,0]);
        assert.strictEqual(r[0], 6, 'No Defense; Single plus with bases loaded; score +1');
        assert.strictEqual(r[1], 18, 'No Defense; Single plus with bases loaded; batter on first');
        assert.strictEqual(r[2], 15, 'No Defense; Single plus with bases loaded; runner first to second');
        assert.strictEqual(r[3], 10, 'No Defense; Single plus with bases loaded; runner second to third');
        assert.strictEqual(r[4], 0, 'No Defense; Single plus with bases loaded; outs same');
        
        r = sim.result_1bplus([5,5,5], 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'Using Defense; Single plus with bases empty, score stays the same');
        assert.strictEqual(r[1], -1, 'Using Defense; Single plus with bases empty, first empty');
        assert.strictEqual(r[2], 15, 'Using Defense; Single plus with bases empty, runner on second');
        assert.strictEqual(r[3], -1, 'Using Defense; Single plus with bases empty, third vacant');
        assert.strictEqual(r[4], 0, 'Using Defense; Single plus with bases empty, outs stay the same');
        
        for (var i = 0; i < 100; i++) {
          r = sim.result_1bplus([5,5,5], 18, [5,-1,10,22,0]);
          assert.strictEqual(r[1], -1, 'Using Defense; Single plus with runners on second and third; first empty');
          assert.strictEqual(r[2], 18, 'Using Defense; Single plus with runners on second and third; batter on second');
          assert.strictEqual(r[3], -1, 'Using Defense; Single plus with runners on second and third; third always empty');
          if(r[0] === 6){
            assert.strictEqual(r[4], 1, 'Using Defense; Single plus with runners on second and third, outs +1 when only 1 run scores');
          }
          else if(r[0] === 7){
            assert.strictEqual(r[4], 0, 'Using Defense; Single plus with runners on second and third, outs same when 2 runs score');
          }
          else {
            assert.ok(false, 'Using Defense; Single plus with runners on second and third; score should be one of two strict values')
          }
        }
        
        r = sim.result_1bplus([5,5,5], 18, [5,22,-1,-1,0]);
        assert.strictEqual(r[0], 5, 'Using Defense; Single plus with runner on first, score same');
        assert.strictEqual(r[1], 18, 'Using Defense; Single plus with runner on first, batter on first');
        assert.strictEqual(r[2], 22, 'Using Defense; Single plus with runner on first, runner first to second');
        assert.strictEqual(r[3], -1, 'Using Defense; Single plus with runner on first, third empty');
        assert.strictEqual(r[4], 0, 'Using Defense; Single plus with runner on first, outs same');
        
        for (var i = 0; i < 100; i++) {
          r = sim.result_1bplus([5,5,5], 18, [5,15,10,22,0]);
          assert.strictEqual(r[1], 18, 'Using defense; Single plus with bases loaded; batter on first');
          assert.strictEqual(r[2], 15, 'Using defense; Single plus with bases loaded; runner first to second');
          assert.strictEqual(r[3], -1, 'Using defense; Single plus with bases loaded; third always empty');
          if(r[0] === 6){
            assert.strictEqual(r[4], 1, 'Using defense; Single plus with bases loaded; if one run scores than than one runner was thrown out at the plate');
          }
          else if(r[0] === 7){
            assert.strictEqual(r[4], 0, 'Using defense; Single plus with bases loaded; if 2 runs score then no outs made');
          }
          else {
            assert.ok(false, 'Using defense; Single plus with bases loaded; score should be one of two strict values')
          }
        }
      },
      
      result_2b: function () {
        var r;
        r = sim.result_2b(0, 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'No Defense; Double with bases empty, score stays the same');
        assert.strictEqual(r[1], -1, 'No Defense; Double with bases empty, first vacant');
        assert.strictEqual(r[2], 15, 'No Defense; Double with bases empty, runner on second');
        assert.strictEqual(r[3], -1, 'No Defense; Double with bases empty, third vacant');
        assert.strictEqual(r[4], 0, 'No Defense; Double with bases empty, outs stay the same');
        
        r = sim.result_2b(0, 18, [5,-1,10,22,0]);
        assert.strictEqual(r[0], 7, 'No Defense; Double with runners on second and third, score +2');
        assert.strictEqual(r[1], -1, 'No Defense; Double with runners on second and third, first empty');
        assert.strictEqual(r[2], 18, 'No Defense; Double with runners on second and third, batter on second');
        assert.strictEqual(r[3], -1, 'No Defense; Double with runners on second and third, third empty');
        assert.strictEqual(r[4], 0, 'No Defense; Double with runners on second and third, outs stay the same');
        
        r = sim.result_2b(0, 18, [5,22,-1,-1,0]);
        assert.strictEqual(r[0], 5, 'No Defense; Double with runner on first, score same');
        assert.strictEqual(r[1], -1, 'No Defense; Double with runner on first, first empty');
        assert.strictEqual(r[2], 18, 'No Defense; Double with runner on first, batter on second');
        assert.strictEqual(r[3], 22, 'No Defense; Double with runner on first, runner first to third');
        assert.strictEqual(r[4], 0, 'No Defense; Double with runner on first, outs same');
        
        r = sim.result_2b(0, 18, [5,15,10,22,0]);
        assert.strictEqual(r[0], 7, 'No Defense; Double with bases loaded; score +2');
        assert.strictEqual(r[1], -1, 'No Defense; Double with bases loaded; first empty');
        assert.strictEqual(r[2], 18, 'No Defense; Double with bases loaded; batter on second');
        assert.strictEqual(r[3], 15, 'No Defense; Double with bases loaded; runner first to third');
        assert.strictEqual(r[4], 0, 'No Defense; Double with bases loaded; outs same');
        
        r = sim.result_2b([5,5,5], 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'Using Defense; Double with bases empty, score stays the same');
        assert.strictEqual(r[1], -1, 'Using Defense; Double with bases empty, first empty');
        assert.strictEqual(r[2], 15, 'Using Defense; Double with bases empty, runner on second');
        assert.strictEqual(r[3], -1, 'Using Defense; Double with bases empty, third vacant');
        assert.strictEqual(r[4], 0, 'Using Defense; Double with bases empty, outs stay the same');
        
        r = sim.result_2b([5,5,5], 18, [5,-1,10,22,0]);
        assert.strictEqual(r[0], 7, 'Using Defense; Double with runners on second and third; score +2');
        assert.strictEqual(r[1], -1, 'Using Defense; Double with runners on second and third; first empty');
        assert.strictEqual(r[2], 18, 'Using Defense; Double with runners on second and third; batter on second');
        assert.strictEqual(r[3], -1, 'Using Defense; Double with runners on second and third; third empty');
        assert.strictEqual(r[4], 0, 'Using Defense; Double with runners on second and third, outs same');
        
        for (var i = 0; i < 100; i++) {
          r = sim.result_2b([5,5,5], 18, [5,22,-1,-1,0]);
          assert.strictEqual(r[1], -1, 'Using Defense; Double with runner on first, first empty');
          assert.strictEqual(r[2], 18, 'Using Defense; Double with runner on first, batter on second');
          assert.strictEqual(r[3], -1, 'Using Defense; Double with runner on first, third empty');
          if(r[0] === 5){
            assert.strictEqual(r[4], 1, 'Using Defense; Double with runners on second and third, outs +1 when nobody scores');
          }
          else if(r[0] === 6){
            assert.strictEqual(r[4], 0, 'Using Defense; Double with runners on second and third, outs same when 1 run scores');
          }
          else {
            assert.ok(false, 'Using Defense; Double with runners on second and third; score should be one of two strict values')
          }
        }
        
        for (var i = 0; i < 100; i++) {
          r = sim.result_2b([5,5,5], 18, [5,15,10,22,0]);
          assert.strictEqual(r[1], -1, 'Using defense; Double with bases loaded; first empty');
          assert.strictEqual(r[2], 18, 'Using defense; Double with bases loaded; batter on second');
          assert.strictEqual(r[3], -1, 'Using defense; Double with bases loaded; third always empty');
          if(r[0] === 7){
            assert.strictEqual(r[4], 1, 'Using defense; Double with bases loaded; if 2 runs score than than one runner was thrown out at the plate');
          }
          else if(r[0] === 8){
            assert.strictEqual(r[4], 0, 'Using defense; Double with bases loaded; if 3 runs score then no outs made');
          }
          else {
            assert.ok(false, 'Using defense; Double with bases loaded; score should be one of two strict values')
          }
        }
      },
      
      result_3b: function () {
        var r;
        r = sim.result_3b(0, 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'No Defense; Triple with bases empty, score stays the same');
        assert.strictEqual(r[1], -1, 'No Defense; Triple with bases empty, first vacant');
        assert.strictEqual(r[2], -1, 'No Defense; Triple with bases empty, second vacant');
        assert.strictEqual(r[3], 15, 'No Defense; Triple with bases empty, batter on third');
        assert.strictEqual(r[4], 0, 'No Defense; Triple with bases empty, outs stay the same');
        
        r = sim.result_3b(0, 18, [5,-1,10,22,0]);
        assert.strictEqual(r[0], 7, 'No Defense; Triple with runners on second and third, score +2');
        assert.strictEqual(r[1], -1, 'No Defense; Triple with runners on second and third, first empty');
        assert.strictEqual(r[2], -1, 'No Defense; Triple with runners on second and third, second empty');
        assert.strictEqual(r[3], 18, 'No Defense; Triple with runners on second and third, batter on third');
        assert.strictEqual(r[4], 0, 'No Defense; Triple with runners on second and third, outs stay the same');
        
        r = sim.result_3b(0, 18, [5,22,-1,-1,0]);
        assert.strictEqual(r[0], 6, 'No Defense; Triple with runner on first, score +1');
        assert.strictEqual(r[1], -1, 'No Defense; Triple with runner on first, first empty');
        assert.strictEqual(r[2], -1, 'No Defense; Triple with runner on first, second empty');
        assert.strictEqual(r[3], 18, 'No Defense; Triple with runner on first, batter on third');
        assert.strictEqual(r[4], 0, 'No Defense; Triple with runner on first, outs same');
        
        r = sim.result_3b(0, 18, [5,15,10,22,0]);
        assert.strictEqual(r[0], 8, 'No Defense; Triple with bases loaded; score +3');
        assert.strictEqual(r[1], -1, 'No Defense; Triple with bases loaded; first empty');
        assert.strictEqual(r[2], -1, 'No Defense; Triple with bases loaded; second empty');
        assert.strictEqual(r[3], 18, 'No Defense; Triple with bases loaded; batter on third');
        assert.strictEqual(r[4], 0, 'No Defense; Triple with bases loaded; outs same');
        
        r = sim.result_3b([5,5,5], 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 0, 'Using Defense; Triple with bases empty, score stays the same');
        assert.strictEqual(r[1], -1, 'Using Defense; Triple with bases empty, first vacant');
        assert.strictEqual(r[2], -1, 'Using Defense; Triple with bases empty, second vacant');
        assert.strictEqual(r[3], 15, 'Using Defense; Triple with bases empty, batter on third');
        assert.strictEqual(r[4], 0, 'Using Defense; Triple with bases empty, outs stay the same');
        
        r = sim.result_3b([5,5,5], 18, [5,-1,10,22,0]);
        assert.strictEqual(r[0], 7, 'Using Defense; Triple with runners on second and third, score +2');
        assert.strictEqual(r[1], -1, 'Using Defense; Triple with runners on second and third, first empty');
        assert.strictEqual(r[2], -1, 'Using Defense; Triple with runners on second and third, second empty');
        assert.strictEqual(r[3], 18, 'Using Defense; Triple with runners on second and third, batter on third');
        assert.strictEqual(r[4], 0, 'Using Defense; Triple with runners on second and third, outs stay the same');
        
        r = sim.result_3b([5,5,5], 18, [5,22,-1,-1,0]);
        assert.strictEqual(r[0], 6, 'Using Defense; Triple with runner on first, score +1');
        assert.strictEqual(r[1], -1, 'Using Defense; Triple with runner on first, first empty');
        assert.strictEqual(r[2], -1, 'Using Defense; Triple with runner on first, second empty');
        assert.strictEqual(r[3], 18, 'Using Defense; Triple with runner on first, batter on third');
        assert.strictEqual(r[4], 0, 'Using Defense; Triple with runner on first, outs same');
        
        r = sim.result_3b([5,5,5], 18, [5,15,10,22,0]);
        assert.strictEqual(r[0], 8, 'Using Defense; Triple with bases loaded; score +3');
        assert.strictEqual(r[1], -1, 'Using Defense; Triple with bases loaded; first empty');
        assert.strictEqual(r[2], -1, 'Using Defense; Triple with bases loaded; second empty');
        assert.strictEqual(r[3], 18, 'Using Defense; Triple with bases loaded; batter on third');
        assert.strictEqual(r[4], 0, 'Using Defense; Triple with bases loaded; outs same');
      },
      
      result_hr: function () {
        var r;
        r = sim.result_hr(0, 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 1, 'No Defense; Home Run with bases empty, score +1');
        assert.strictEqual(r[1], -1, 'No Defense; Home Run with bases empty, first vacant');
        assert.strictEqual(r[2], -1, 'No Defense; Home Run with bases empty, second vacant');
        assert.strictEqual(r[3], -1, 'No Defense; Home Run with bases empty, third vacant');
        assert.strictEqual(r[4], 0, 'No Defense; Home Run with bases empty, outs stay the same');
        
        r = sim.result_hr(0, 18, [5,-1,10,22,0]);
        assert.strictEqual(r[0], 8, 'No Defense; Home Run with runners on second and third, score +3');
        assert.strictEqual(r[1], -1, 'No Defense; Home Run with runners on second and third, first empty');
        assert.strictEqual(r[2], -1, 'No Defense; Home Run with runners on second and third, second empty');
        assert.strictEqual(r[3], -1, 'No Defense; Home Run with runners on second and third, third empty');
        assert.strictEqual(r[4], 0, 'No Defense; Home Run with runners on second and third, outs stay the same');
        
        r = sim.result_hr(0, 18, [5,22,-1,-1,0]);
        assert.strictEqual(r[0], 7, 'No Defense; Home Run with runner on first, score +2');
        assert.strictEqual(r[1], -1, 'No Defense; Home Run with runner on first, first empty');
        assert.strictEqual(r[2], -1, 'No Defense; Home Run with runner on first, second empty');
        assert.strictEqual(r[3], -1, 'No Defense; Home Run with runner on first, third empty');
        assert.strictEqual(r[4], 0, 'No Defense; Home Run with runner on first, outs same');
        
        r = sim.result_hr(0, 18, [5,15,10,22,0]);
        assert.strictEqual(r[0], 9, 'No Defense; Home Run with bases loaded; score +4');
        assert.strictEqual(r[1], -1, 'No Defense; Home Run with bases loaded; first empty');
        assert.strictEqual(r[2], -1, 'No Defense; Home Run with bases loaded; second empty');
        assert.strictEqual(r[3], -1, 'No Defense; Home Run with bases loaded; third empty');
        assert.strictEqual(r[4], 0, 'No Defense; Home Run with bases loaded; outs same');
        
        r = sim.result_hr([5,5,5], 15, [0,-1,-1,-1,0]);
        assert.strictEqual(r[0], 1, 'Using Defense; Home Run with bases empty, score +1');
        assert.strictEqual(r[1], -1, 'Using Defense; Home Run with bases empty, first vacant');
        assert.strictEqual(r[2], -1, 'Using Defense; Home Run with bases empty, second vacant');
        assert.strictEqual(r[3], -1, 'Using Defense; Home Run with bases empty, third vacant');
        assert.strictEqual(r[4], 0, 'Using Defense; Home Run with bases empty, outs stay the same');
        
        r = sim.result_hr([5,5,5], 18, [5,-1,10,22,0]);
        assert.strictEqual(r[0], 8, 'Using Defense; Home Run with runners on second and third, score +3');
        assert.strictEqual(r[1], -1, 'Using Defense; Home Run with runners on second and third, first empty');
        assert.strictEqual(r[2], -1, 'Using Defense; Home Run with runners on second and third, second empty');
        assert.strictEqual(r[3], -1, 'Using Defense; Home Run with runners on second and third, third empty');
        assert.strictEqual(r[4], 0, 'Using Defense; Home Run with runners on second and third, outs stay the same');
        
        r = sim.result_hr([5,5,5], 18, [5,22,-1,-1,0]);
        assert.strictEqual(r[0], 7, 'Using Defense; Home Run with runner on first, score +2');
        assert.strictEqual(r[1], -1, 'Using Defense; Home Run with runner on first, first empty');
        assert.strictEqual(r[2], -1, 'Using Defense; Home Run with runner on first, second empty');
        assert.strictEqual(r[3], -1, 'Using Defense; Home Run with runner on first, third empty');
        assert.strictEqual(r[4], 0, 'Using Defense; Home Run with runner on first, outs same');
        
        r = sim.result_hr([5,5,5], 18, [5,15,10,22,0]);
        assert.strictEqual(r[0], 9, 'Using Defense; Home Run with bases loaded; score +4');
        assert.strictEqual(r[1], -1, 'Using Defense; Home Run with bases loaded; first empty');
        assert.strictEqual(r[2], -1, 'Using Defense; Home Run with bases loaded; second empty');
        assert.strictEqual(r[3], -1, 'Using Defense; Home Run with bases loaded; third empty');
        assert.strictEqual(r[4], 0, 'Using Defense; Home Run with bases loaded; outs same');
      }
      
    });
});