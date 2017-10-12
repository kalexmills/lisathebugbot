var debug = require('debug')('botkit:weekly-roundup');
var CronJob = require('cron').CronJob;


module.exports = function(controller) {
  var team_id = "T04EJK6G6";
  var roundup_chan = "C04EJKG96";   // #engineering 
                     //"C06DT863F"; // #testchannel
  var max_users = 3;
  var this_week = week1;
  
  function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  var fake_user = "fake-user";
  // include the user ids of verified jira bots.
  var allowed_users = ["U6W8FJ75F",  // Alex
                       fake_user];
  
  //console.log(controller);
  
  // Runs every Friday at 12:30pm
  var weekly_roundup = new CronJob('00 30 12 * * 5', function() {
      // TODO: clean up DB weekly.    
      console.log("Beginning weekly roundup!");
      console.log("controller",controller);
      var bot = controller.spawn({token: controller.config.botToken});
    
      bot.startRTM(function(err, bot, payload) {
        if(err) throw new Error("Could not connect to slack!");
        
        controller.storage.users.all(function(err, all_users) {
          if(all_users) {
            var sorted_users = all_users.filter((a) => {return a.bugs;}).sort(function(a,b){
              return b.bugs.length - a.bugs.length;
            });
            console.log(sorted_users);
            var first = sorted_users[0];
            var second = sorted_users[1];
            var third = sorted_users[2];
            
            var message = {
              "id": 1,
              "type": "message",
              "channel": roundup_chan,
              "text": week4(first, second, third)
            };
            bot.rtm.send(JSON.stringify(message));
            bot.closeRTM();
          }
        });
       
        setTimeout(function() {
            bot.closeRTM();
        }, 5000);
      });
    }, function() {
      console.log("Weekly roundup completed.");
    }, 
    true, /* Start job immediately */
    'America/Los_Angeles' /* Time-zone to use */
  );
  
  
  // Roundup script used on week #4
  var week4 = function(first, second, third) {
    console.log("Running week 4 script.");
    var response = "Iiiiiiiit's Weekly Roundup Time!!! :smile:\n";
    response += "Here we go!\n";    
    if(third) {
      response += third.id + " landed in third, with " + third.bugs.length + " squashed bugs!\n";
      response += "Great job, " + firstName(third.id) + "! Here is your prize! :white_check_mark:\n";
    } else {
      response += "Hmm... it seems fewer than three people squashed any bugs.\n";
    }
    if(second) {
      response += second.id + " wound up in second place and squashed " + second.bugs.length + " bugs!\n";
      response += "So close, " + firstName(second.id) + "! Here is *your* prize: :birthday:\n";
    } else {
      response += "Wow! Fewer than two people squashed any bugs this week.\n";
      response += "Everyone must be on vacation or something...\n";
    }
    if(first) {
      response += "And the first place winner is " + first.id + " with " + first.bugs.length + " bugs!!!!\n";
      response += "Way to go, " + firstName(first.id) + "! For you we have the *GRAND* prize! :dark_sunglasses:\n";
    } else {
      response += "What?! This can't be!\n";
      response += "Say it ain't so!\n";
      response += "*NO ONE* squashed any bugs!? :open-mouth:\n";
      response += "Oh well! There's probably a good reason for that. :thinking-face:\n";
      response += "Sure makes my life easy... :smile:\n";
      response += "And boring... :confused:\n";
      response += "Ya'll should really work harder so I can have something to do around here! :thumbsup:\n";
    }
    response += "Welp, that's all for this week's edition of the weekly roundup!\n";
    response += "See you all next Friday for more of the same!\n";
    return response;
  }
  
  // Roundup script used on week #3
  var week3 = function(first, second, third) {
    console.log("Running week 3 script.");
    var response = "Time for the weekly round-up! Bet you all thought I forgot! :sweat_smile:\n";
    response += "Well no such luck! :smirk:\n";    
    if(third) {
      response += third.id + " came in third place, with " + third.bugs.length + " squashed bugs!\n";
      response += "Great job, " + firstName(third.id) + "! Here is your prize! :clap:\n";
    } else {
      response += "Hmm... it seems fewer than three people squashed any bugs.\n";
    }
    if(second) {
      response += second.id + " came in second place and squashed " + second.bugs.length + " bugs!\n";
      response += "So close, " + firstName(second.id) + "! Here is *your* prize: :star2:\n";
    } else {
      response += "Wow! Fewer than two people squashed any bugs this week.\n";
      response += "Everyone must be on vacation or something...\n";
    }
    if(first) {
      response += "And the first place winner is " + first.id + " with " + first.bugs.length + " bugs!!!!\n";
      response += "Way to go, " + firstName(first.id) + "! For you we have the *GRAND* prize! :crown:\n";
    } else {
      response += "What?! This can't be!\n";
      response += "Say it ain't so!\n";
      response += "*NO ONE* squashed any bugs!? :open-mouth:\n";
      response += "Oh well! There's probably a good reason for that. :thinking-face:\n";
      response += "Sure makes my life easy... :smile:\n";
      response += "And boring... :confused:\n";
      response += "Ya'll should really work harder so I can have something to do around here! :thumbsup:\n";
    }
    response += "Welp, that's all for this week's edition of the weekly roundup!\n";
    response += "See you all next Friday for more of the same!\n";
    return response;
  }
  
  // Roundup script used on week #2
  var week2 = function(first, second, third) {
    console.log("Running week 2 script.");
    var response = "Hey, hey! It's weekly bug roundup time! Let's get started!\n";
        
    if(third) {
      response += third.id + " came in third place, with " + third.bugs.length + " squashed bugs!\n";
      response += "Great job, " + firstName(third.id) + "! Here is your prize! :tropical_fish:\n";
    } else {
      response += "Hmm... it seems fewer than three people squashed any bugs.\n";
    }
    if(second) {
      response += second.id + " came in second place and squashed " + second.bugs.length + " bugs!\n";
      response += "So close, " + firstName(second.id) + "! Here is *your* prize: :sports_medal:\n";
    } else {
      response += "Wow! Fewer than two people squashed any bugs this week.\n";
      response += "Everyone must be on vacation or something...\n";
    }
    if(first) {
      response += "And the first place winner is " + first.id + " with a whopping " + first.bugs.length + " bugs!!!!\n";
      response += "Way to go, " + firstName(first.id) + "! For you we have the *GRAND* prize! :trophy:\n";
    } else {
      response += "What?! This can't be!\n";
      response += "Say it ain't so!\n";
      response += "*NO ONE* squashed any bugs!? :open-mouth:\n";
      response += "Oh well! There's probably a good reason for that. :thinking-face:\n";
      response += "Sure makes my life easy... :smile:\n";
      response += "And boring... :confused:\n";
      response += "Ya'll should really work harder so I can have something to do around here! :thumbsup:\n";
    }
    response += "Welp, that's all for this week's edition of the weekly roundup!\n";
    response += "See you all next Friday for more of the same!\n";
    return response;
  }
    
  // Roundup script used on week #1
  var week1 = function(first, second, third) {
    console.log("Running week 1 script.");
    var response = "Hey, everybody! It's time for the weekly bug roundup!\n";
        
    if(third) {
      response += third.id + " came in third place, with " + third.bugs.length + " squashed bugs!\n";
      response += "Great job, " + firstName(third.id) + "!\n";
    } else {
      response += "Hmm... it seems fewer than three people squashed any bugs.\n";
    }
    if(second) {
      response += second.id + " came in second place and squashed " + second.bugs.length + " bugs!\n";
      response += "So close, " + firstName(second.id) + ", try again next week.\n";
    } else {
      response += "Wow! Fewer than two people squashed any bugs this week.\n";
      response += "Everyone must be on vacation or something...\n";
    }
    if(first) {
      response += "And the first place winner is " + first.id + " with a whopping " + first.bugs.length + " bugs!!!!\n";
      response += "Way to go, " + firstName(first.id) + "! You're the greatest!!!\n";
    } else {
      response += "What?! This can't be!\n";
      response += "Say it ain't so!\n";
      response += "*NO ONE* squashed any bugs!? :open-mouth:\n";
      response += "Oh well! There's probably a good reason for that. :thinking-face:\n";
      response += "Sure makes my life easy... :smile:\n";
      response += "And boring... :confused:\n";
      response += "Ya'll should really work harder so I can have something to do around here! :thumbsup:\n";
    }
    response += "Welp, that's all for this week's edition of the weekly roundup!\n";
    response += "See you all next Friday for more of the same! :wink:\n";
    return response;
  }
  
  function firstName(name) {
    return name.split(" ")[0];
  }
  
}
