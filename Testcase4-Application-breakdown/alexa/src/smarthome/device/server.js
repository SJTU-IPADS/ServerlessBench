'use strict';

const express = require('express');
const bodyParser = require('body-parser')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Control variables
var dev_switch = 'OFF';

// App
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('switch ' + dev_switch);
});

app.post('/', (req, res) => {
    // verify instruction
    var req_switch = req.body.req_switch;
    if (req_switch !== 'ON' && req_switch !== 'OFF') {
        res.send('illegal switch instruction: ' + req_switch);
    } else {
        dev_switch = req_switch;
        res.send(process.env.DEVICE_NAME + ': switch ' + dev_switch);
    }
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
