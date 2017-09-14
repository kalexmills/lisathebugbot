var debug = require('debug')('botkit:bug_fixed');

module.exports = function(controller) {
  
  // check my squish score
  controller.hears(['count', 'score', 'bugs', 'killcount', 'squishscore', 'bugs', 'number'], 
                   ['message_received','direct_message'], function(bot, message){
    bot.api.users.info({user: message.user}, (error, response) => {
      let {name, real_name} = response.user;
      controller.storage.teams.get(real_name, (error, response) => {
        var check_action = [
            "checked my clipboard",
            "queried my database",
            "glanced at my notes",
            "looked over my records",
            "consulted my data",
          ];
        if(error){
          var exhortation = [
            "Better get to work!",
            "Are you really trying?",
            "Let's pick up the pace!",
            "Why no bug love from you?"
          ]
          bot.whisper(message, "I've " + rand(check_action) + " and I don't have any bugs mentioned for you. " + rand(exhortation));
          console.log(error);
        } else {
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
          ]
          var violent_verb = [ "smashed", 
                              "eviscerated", 
                              "squashed", 
                             "slammed", 
                              "blown-up", 
                              ":zap:",
                              ":boom:",
                              "whacked"];
          bot.whisper(message, "I've " + rand(check_action)  + " and it looks like you've " + rand(violent_verb)
                     + " " + response.count + " bugs so far! " + rand(cheer));
        }
      });
    });
  });

  // user ids of users who lisa will listen to... to prevent cheating this should only
  // include rthe user ids of verified jira bots.
  var allowed_users = ["B72TB8DSA",  // BridgeBot
                      ];
  
  // Record a bug count whenever the Jira integration announces a transition.
  controller.hears(['([A-Za-z]+) ([A-Za-z]+) changed Bug (.*) from .* to "Resolved"'],['message_received','direct_message'],function(bot,message) {
    if(allowed_users.includes(message.user)) {

      // reply with a random emoji / complement combination
      var person = message.match[1];
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

      var user_id = message.match[1] + " " + message.match[2];


      controller.storage.teams.get(user_id, function(err_outer, data) {
        if(err_outer) {
          controller.storage.teams.save({id: user_id, count: 1}, function(err_inner) {
            if(err_inner) {
              console.log("Could not save a new bug for user " + user_id);
              console.log(err_inner);
            } else {
              console.log("Persisted new record for user " + user_id);
            }
          });
        } else {
          controller.storage.teams.save({id: user_id, count: data["count"] + 1}, function(err_inner) {
            if(err_inner) {
              console.log("Could not update bug record for user " + user_id);
              console.log(err_inner);
            }
            console.log("Incremented bug count for " + user_id + " to " + data["count"]);
          });
        }
      });

    } else {
      bot.whisper(message, "<@${user}>, I think you're trying to cheat!");
    }
  });

  function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

}
