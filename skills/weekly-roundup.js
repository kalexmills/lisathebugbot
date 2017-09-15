var debug = require('debug')('botkit:weekly-roundup');

module.exports = function(controller) {
  
  var roundup_chan = "C06DT863F";
  var max_users = 3;
  
  function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  controller.hears(['weekly-roundup'], ['direct_message'], function(bot, message) {
    
    bot.startConversation({
            user: "weekly-roundup",
            channel: roundup_chan,
        }, function(response, convo) {
      
      convo.say("Hey, everybody! It's time for the weekly bug roundup!");
      convo.say("Let's look to see the top three bug squashers over the past week!");
      convo.say("Remember, it's not a competition! Just good clean fun...");
      convo.say("...and may the best developer win!");
      controller.storage.users.all(function(err, all_users) {
        if(all_users) {
          var sorted_users = all_users.filter((a) => {return a.bugs;}).sort(function(a,b){
            return b.bugs.length - a.bugs.length;
          });
          console.log(sorted_users);
          var first = sorted_users[0];
          var second = sorted_users[1];
          var third = sorted_users[2];
          
          if(third) {
            convo.say(third.id + " came in third place, with " + third.bugs.length);
            convo.say("Great job, " + third.id);
          } else {
            convo.say("Hmm... it seems fewer than three people squashed any bugs.");
          }
          if(second) {
            convo.say(second.id + " came in second place and squashed" + second.bugs.length + " bugs!");
            convo.say("So close, " + second.id + " try again next week.");
          } else {
            convo.say("Wow! Fewer than two people squashed any bugs this week.");
            convo.say("Everyone must be on vacation or something...");
          }
          if(first) {
            convo.say("And the first place winner is....!");
            convo.say(first.id + " with a whopping " + first.bugs.length + " bugs!");
            convo.say("Way to go, " + first.id + "!");
          } else {
            convo.say("What?! This can't be!");
            convo.say("Say it ain't so!");
            convo.say("*NO ONE* squashed any bugs!?");
            convo.say("Oh well! There's probably a good reason for that.");
            convo.say("Sure makes my life easy...");
            convo.say("And boring...");
            convo.say("Ya'll should really work harder so I can have something to do...");
          }
        } else {
          console.log("Could not read all users");
          console.log(err);
        }
      });
    });
  });
  
}
