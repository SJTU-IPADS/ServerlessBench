# Alexa Skill Application

Alexa skill application contains several functions for Alexa skills that can be hold on OpenWhisk.

Currently 3 skills are supported: fact, reminder, and smarthome.

ACKNOWLEDGEMENT:

Alexa skills application borrowed codes from [skill-sample-nodejs-fact](https://github.com/alexa/skill-sample-nodejs-fact) provided by Amazon, with modifications to support skills other than simple fact, and architectural changes to make the skills compatible with OpenWhisk.

For evaluation purpose, Alexa skills application is packed with a front-end and a interact action to conveniently take input from evaluation scripts and send the request to the skills. Alexa skills referred [Virtual Alexa project](https://github.com/bespoken/virtual-alexa) to set up the interaction with skills.
