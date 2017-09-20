var debug = require('debug')('botkit:weekly-roundup');



module.exports = function(controller) {
  
  var roundup_chan = "C06DT863F";
  var max_users = 3;
  var this_week = week1;
  
  function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  controller.hears(['weekly-roundup'], ['direct_message'], function(bot, message) {
    
    bot.startConversation({
            user: "weekly-roundup",
            channel: roundup_chan,
        }, function(response, convo) {
      
      // TODO: fix ties
      controller.storage.users.all(function(err, all_users) {
        if(all_users) {
          var sorted_users = all_users.filter((a) => {return a.bugs;}).sort(function(a,b){
            return b.bugs.length - a.bugs.length;
          });
          console.log(sorted_users);
          var first = sorted_users[0];
          var second = sorted_users[1];
          var third = sorted_users[2];
          
          console.log("Running week 1 script.");
          convo.say("Hey, everybody! It's time for the weekly bug roundup!");
          convo.say("Let's look to see the top three bug squashers over the past week!");
          convo.say("Remember, it's not a competition! Just good clean fun...");
          convo.say("...and may the best developer win!");

          if(third) {
            convo.say(third.id + " came in third place, with " + third.bugs.length + " squashed bugs!");
            convo.say("Great job, " + firstName(third.id) + "!");
          } else {
            convo.say("Hmm... it seems fewer than three people squashed any bugs.");
          }
          if(second) {
            convo.say(second.id + " came in second place and squashed " + second.bugs.length + " bugs!");
            convo.say("So close, " + firstName(second.id) + ", try again next week.");
          } else {
            convo.say("Wow! Fewer than two people squashed any bugs this week.");
            convo.say("Everyone must be on vacation or something...");
          }
          if(first) {
            convo.say("And the first place winner is....!");
            convo.say(first.id + " with a whopping " + first.bugs.length + " bugs!");
            convo.say("Way to go, " + firstName(first.id) + "! You're the greatest!!!");
          } else {
            convo.say("What?! This can't be!");
            convo.say("Say it ain't so!");
            convo.say("*NO ONE* squashed any bugs!? :open-mouth:");
            convo.say("Oh well! There's probably a good reason for that. :thinking-face:");
            convo.say("Sure makes my life easy... :smile:");
            convo.say("And boring... :confused:");
            convo.say("Ya'll should really work harder so I can have something to do around here! :thumbsup:");
          }
          
        }
      });
    });
  });
  
  // Roundup script used on week #1
  var week1 = function(convo, first, second, third) {
    console.log("Running week 1 script.");
    convo.say("Hey, everybody! It's time for the weekly bug roundup!");
    convo.say("Let's look to see the top three bug squashers over the past week!");
    convo.say("Remember, it's not a competition! Just good clean fun...");
    convo.say("...and may the best developer win!");

    if(third) {
      convo.say(third.id + " came in third place, with " + third.bugs.length + " squashed bugs!");
      convo.say("Great job, " + firstName(third.id) + "!");
    } else {
      convo.say("Hmm... it seems fewer than three people squashed any bugs.");
    }
    if(second) {
      convo.say(second.id + " came in second place and squashed " + second.bugs.length + " bugs!");
      convo.say("So close, " + firstName(second.id) + ", try again next week.");
    } else {
      convo.say("Wow! Fewer than two people squashed any bugs this week.");
      convo.say("Everyone must be on vacation or something...");
    }
    if(first) {
      convo.say("And the first place winner is....!");
      convo.say(first.id + " with a whopping " + first.bugs.length + " bugs!");
      convo.say("Way to go, " + firstName(first.id) + "! You're the greatest!!!");
    } else {
      convo.say("What?! This can't be!");
      convo.say("Say it ain't so!");
      convo.say("*NO ONE* squashed any bugs!? :open-mouth:");
      convo.say("Oh well! There's probably a good reason for that. :thinking-face:");
      convo.say("Sure makes my life easy... :smile:");
      convo.say("And boring... :confused:");
      convo.say("Ya'll should really work harder so I can have something to do around here! :thumbsup:");
    }
    convo.say("Welp, that's all for this week's edition of the weekly roundup!");
    convo.say("See you all next Friday for more of the same!");
  }
  
  function firstName(name) {
    return name.split(" ")[0];
  }
  
}
