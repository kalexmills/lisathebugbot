var debug = require('debug')('botkit:bug-fixed');

module.exports = function(controller) {
  
  // Record a bug count whenever the Jira integration announces a transition. 
  controller.on('bot_message',
                   function(bot,message) {
    
    console.log("Received a bot message!");
    
    // user ids of users who lisa will listen to... to prevent cheating this should only
    // include the user ids of verified jira bots.
    var allowed_bots = ["B72TB8DSA",  // BridgeBot
                        "B06KWC6UV",  // jira in #jira
                     ];
  
    var re = /([A-Za-z]+) ([A-Za-z]+) changed Bug (.*) from .* to "Resolved"/i;
    
    if(allowed_bots.includes(message.bot_id) && message.attachments[0].pretext) {
      var match = message.attachments[0].pretext.match(re);
      
        if(match) {

        console.log("Received a valid bug resolution message!");

        console.log(match);

        console.log("Name: " + match[1] + " " + match[2] + "\nLink:" + match[3]);

        // reply with a random emoji / complement combination
        var person = match[1];
        var complement = ["Way to go " + person + "!",
                         "Wooooohoooo!",
                         "Squash those bugs, " + person  + "!",
                         "Great job, " + person + "!",
                         "Congrats, " + person + "! How does it feel?!",
                         "You're the best, " + person + "!"];

        var emojis = ["thumbsup", 
                      "apple", 
                      "100", 
                      "laughing", 
                      "smile", 
                      "joy",
                      "bananadance",
                      "clapping",
                      "metal2",
                      "1up",
                      "coin",
                      "plusone"];


        bot.reply(message, rand(complement) + " " + ":" + rand(emojis) + ":");
        bot.api.reactions.add({
            name: rand(emojis) ,
            channel: message.channel,
            timestamp: message.ts
        });

        // store the info on the weekly leaderboards

        var user_name = match[1] + " " + match[2];

        // Look up the existing user by their user_name.
        controller.storage.users.get(user_name, function(err_outer, user_record) {
          // Create a bug record for this bug.
          var bug_record = {url : match[3], timestamp : message.ts};
          
          if(user_record && user_record.bugs) {
            // Existing user
            

            // Add new bug to existing array of bug records
            if(!user_record.bugs.some(r => { return r.url === match[3];})) {
              user_record.bugs.push(bug_record);    
              controller.storage.users.save(
                  { id: user_name, 
                    bugs_squished: user_record.bugs_squished++,
                    bugs: user_record.bugs
                  }, 
                function(err_inner) {
                  if(err_inner) {
                    console.log("Could not add new bug record " + match[3] + " to user " + user_name);
                    console.log(err_inner);
                  } else {
                    console.log("Added new bug " + match[3] + " to user "  + user_name);
                  }
                });
            }
          } else {

            // New user. Add a new user record
            controller.storage.users.save(
                { id: user_name, 
                  bugs_squished: 0, 
                  bugs: [bug_record]
                }, 
              function(err_inner) {
                if(err_inner) {
                  console.log("Could not save new bug " + match[3] + " for user "  + user_name);
                  console.log(err_inner);
                } else {
                  console.log("Persisted new record for user " + user_name);
                }
              });
          }
        });
      }
    }
  });
  
  
  // User asks for a bug that Lisa remembers
  controller.hears(['flashback', 'remember', 'past', 'reminisce'], 
                   ['message_received', 'direct_message'], function(bot, message) {
    bot.api.users.info({user: message.user}, (error, response) => {
      if(response) {
        let {name, real_name} = response.user;
        controller.storage.users.get(real_name, (error,response) => {
          if(response && response.bugs) {
            var bug = rand(response.bugs).url;
            var reminiscence = [
              "Ahhh, I remember that one time when you solved " + bug + "!",
              "I loved how you made " + bug + " go splat!",
              "Remember " + bug + "? Those were the days!",
              "It was great to see you work on " + bug + ".",
              bug + ", remember that one? That was a good one!",
              "You have no idea how much fun I had when you finished working on " + bug + "."
            ];
            bot.whisper(message, rand(reminiscence));
          } else {
            bot.whisper(message, "Have we met? Are you a developer? I don't remember hearing about you solving any bugs. "
                        + "Maybe I haven't been listening in the right places.");
          }
        });
      }
    });
  });
  
  // Action fired whenever the user checks or mentions their squish score.
  controller.hears(['count', 'score', 'bugs', 'killcount', 'squishscore', 'number'], 
                   ['message_received','direct_message'], function(bot, message){
    // Retrieve user's real name from Slack and store it in real_name
    bot.api.users.info({user: message.user}, (error, response) => {
      let {name, real_name} = response.user;
      real_name = stripName(real_name);
      // Use real_name to lookup information we have collected from Jira slackbot
      controller.storage.users.get(real_name, (error, response) => {
        if(response && response.bugs_squished) {
          whisperScore(bot, message, response.bugs_squished);
        } else if(error || !response || !response.bugs){
          whisperNoBugs(bot,message);
          console.log(error);
        } else {
          whisperScore(bot, message, response.bugs.length);
        }
      });
    });
  });
  
  // Uses bot to whisper a user that they have no recorded bugs
  // in response to a message.
  function whisperNoBugs(bot, message) {
    var exhortation = [
      "Better get to work!",
      "Are you really trying?",
      "Let's pick up the pace!",
      "Why no bug love from you?",
      "It's okay, you're probably busy elsewhere.",
      "The bugs won't fix themselves!"
    ]
    bot.whisper(message, "I've " + randomCheckAction() +
        " and I haven't seen any bugs mentioned for you since the last weekly roundup. " + 
        rand(exhortation));
  }

  // Uses bot to whisper a user their score in response to
  // message. Reports "numBugs" as the user's score.
  function whisperScore(bot, message, numBugs)  {
    var cheer = [
      "Great job!",
      "Hooray!",
      "Wonderful work!",
      "That's a non-zero number!",
      "Yesssss!",
      "Good for you!",
      "Excellent!",
      "Huzzah!",
      "Woohooooo!",
       "You're amazing!"
    ];
    var violent_verb = [ 
      "smashed", 
      "eviscerated", 
      "squashed", 
      "slammed", 
      "blown-up", 
      ":zap:",
      ":boom:",
      "whacked"
    ];
    bot.whisper(message, "I've " + randomCheckAction() +  " and it looks like you've " + 
      rand(violent_verb) + " " + numBugs + " bugs since the last weekly roundup! " +
      rand(cheer));
  }
  
  // Generates a random check action for conversation purposes, like
  // "checked my clipboard", or "queried the database".
  function randomCheckAction() {
    var check_action = [
            "checked",
            "queried",
            "glanced at",
            "looked over",
            "consulted",
            "investigated"
          ];
        var check_art = [ "the", "my"]
        var check_object = [
          "clipboard",
          "database",
          "notes",
          "records",
          "data",
          "logs"
        ]
    return rand(check_action) + " " + rand(check_art) + " " + rand(check_object);
  }
  
  function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  function stripName(real_name) {
    var re = /([a-zA-z]+) ([a-zA-Z]+)/;
    var match = real_name.match(re);
    return match[1] + " " + match[2];
  }

}
