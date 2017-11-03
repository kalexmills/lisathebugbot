var debug = require('debug')('botkit:weekly-roundup');
var CronJob = require('cron').CronJob;


module.exports = function(controller) {
  var team_id = "T04EJK6G6";
  var roundup_chan = //"C04EJKG96";   // #engineering 
                     "C06DT863F"; // #testchannel
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
  var weekly_roundup = new CronJob('00 55 12 * * 5', function() {
      // TODO: clean up DB weekly.    
      console.log("Beginning weekly roundup!");
      console.log("controller",controller);
      var bot = controller.spawn({token: controller.config.botToken});
    
      bot.startRTM(function(err, bot, payload) {
        if(err) throw new Error("Could not connect to slack!");
        
        controller.storage.users.all(function(err, all_users) {
          if(all_users) {
            var sorted_users = all_users.filter((a) => {return a.bugs;}).sort(function(a,b){
              return b.bugs_squished - a.bugs_squished;
            });
            console.log(sorted_users);
            // TODO: handle ties.
            var first = sorted_users[0];
            var second = sorted_users[1];
            var third = sorted_users[2];
            
            var message = {
              "id": 1,
              "type": "message",
              "channel": roundup_chan,
              "text": week6(first, second, third)
            };
            bot.rtm.send(JSON.stringify(message));
            
            // Clean up the weekly bug-count.
            controller.storage.users.all(function(err, all_users) {
              if(all_users) {
                for(var i = 0; i < all_users.length; i++) {
                  if(all_users[i]) {
                    all_users[i].bugs_squished = 0;
                    // You would think the maintainer would encapsulate all this repeated functionality
                    // into a library or something. Too bad he doesn't know Javascript well enough to be
                    // comfortable doing so. Such hackage.
                    controller.storage.users.save(
                      { id: all_users[i].id, 
                        bugs_squished: 0, 
                        bugs: all_users[i].bugs
                      }, 
                    function(err_inner) {
                      if(err_inner) {
                        console.log("Could not clear bug count for user " + all_users[i].id);
                      } else {
                        console.log("Cleared bug count for user " + all_users[i].id);
                      }
                    });
                  }
                }
              }
            });
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
  
  // Explains the winners for each place. Winners is an array of user ids, place is
  // a string containing "first", "second", or "third", and num_bugs is how many
  // bugs each of them squished.
  var explainWinner = function(winners, place, num_bugs) {
    var response = "";
    if(winners.length == 1) {
      var placed_in_place = [
        " came in " + place + " place ",
        " placed in " + place,
        " scored " + place + " place ",
        " won " + place + " place"
      ];
      
      var with_num_bugs_squashed = [
        " with " + num_bugs + " bugs squished!",
        " having squashed " + num_bugs + " bugs.",
        " with a total of " + num_bugs + " squished."
      ];
      
      response += winners[0] + rand(placed_in_place) + rand(with_num_bugs_squashed);
    } else {
      response += "For " + place + " place, we have a tie!\n";
      response += winners.join(", ");
      response += " each placed in " + place + " with " + num_bugs + " squished, each.\n";
    }
    return response;
  }
  
  // Gets the top three winners from the list of sorted users -- respecting ties.
  // The response is an object with three members, "first", "second", and "third", each
  // of which is an array of user IDs of the individuals who scored that place.
  var getWinners = function(sorted_users) {
    var response = {first: [], second: [], third:[]};
    var i = 0;
    // Do you *really* need to encapsulate this repeated code in a single function?
    while(i < sorted_users.length && sorted_users[i].bugs.length == sorted_users[0].bugs.length){
      response.first.push(sorted_users[i].id);
      i++;
    }
    var second_place_score = sorted_users[i].bugs.length;
    while(i < sorted_users.length && sorted_users[i].bugs.length == second_place_score) {
      response.second.push(sorted_users[i].id);
      i++;
    }
    var third_place_score = sorted_users[i].bugs.length;
    while(i < sorted_users.length && sorted_users[i].bugs.length == third_place_score) {
      response.third.push(sorted_users[i].id);
      i++;
    }
    return response;
  }
  // Roundup script used on week #6
  var week6 = function(first, second, third) {
    console.log("Running week 4 script.");
    var response = "Weekly Roundup! (Bug-free version) Go! :mega:\n";
    if(third) {
      response += third.id + " got third! They did in " + third.bugs_squished + " bugs!\n";
      response += "Great job, " + firstName(third.id) + "! Have a prize! :clapping:\n";
    } else {
      response += "Hmm... it seems fewer than three people squashed any bugs.\n";
    }
    if(second) {
      response += second.id + " got second! They smashed " + second.bugs_squished + " bugs!\n";
      response += "Way to go " + firstName(second.id) + "! Have a different prize! :hammer:\n";
    } else {
      response += "Wow! Fewer than two people squashed any bugs this week.\n";
      response += "Everyone must be on vacation or something...\n";
    }
    if(first) {
      response += first.id + " got first! They slaughtered " + first.bugs_squished + " bugs!\n";
      response += "Huzzah for " + firstName(first.id) + "! Have the best prize! :tophat:\n";
    } else {
      response += "What?! This can't be!\n";
      response += "Say it ain't so!\n";
      response += "*NO ONE* squashed any bugs!? :open-mouth:\n";
      response += "Oh well! There's probably a good reason for that. :thinking-face:\n";
      response += "Sure makes my life easy... :smile:\n";
      response += "And boring... :confused:\n";
      response += "Ya'll should really work harder so I can have something to do around here! :thumbsup:\n";
    }
    response += "That's it!\n";
    response += "Next week! Same time! :upside_down_face:\n";
    return response;
  }
  
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
