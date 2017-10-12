# Lisa the Bug Bot

Lisa is a slack bot who loves squishing bugs. She listens to Jira Server Alerts and keeps a running count of bugs squished by different users.

Based on the [Botkit Slack starter kit](https://github.com/howdyai/botkit). Currently deployed at [Cohesity](https://www.cohesity.com).

## Feature Roadmap
 - Automatically age out bugs. Currently, the database has to be cleaned out manually from the command-line. The weekly roundup script should instead make use of the timestamp information that is stored along with each bug. It would also be nice if the system tracked weekly bugs separately from the database, otherwise sorting through all the bugs will become slow in 2-3 years time.
 - Randomize the weekly roundup script and the prizes given.
 - Accurately handle ties in the weekly-roundup script.
 - Track "streaks" for users who win the weekly-roundup multiple weeks in a row, and who place first multiple weeks in a row. Report this information along with the weekly roundup.
