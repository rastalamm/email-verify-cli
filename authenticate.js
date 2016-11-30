(function () {
    "use strict";
    const Promise = require('bluebird');
    const request = Promise.promisify(require('request'));

    const apiUsername = require('./apiKeys.js').username;
    const apiSecretKey = require('./apiKeys.js').key;

    const authenticateNeverBounce = function () {
        request({
            method: 'POST',
            url: `https://api.neverbounce.com/v3/access_token`,
            auth: {
                username: apiUsername,
                password: apiSecretKey
            },
            form: {
                grant_type: "client_credentials",
                scope: 'basic'
                // scope: 'user'
            }
        }).then(function (response) {
            if (response.statusCode !== 200) {
                console.error(`Received a ${response.statusCode} error. \n ${response.body}`);
            } else {
                console.log("You're all set! Time to start validating emails");
                console.log("Type in: \n node check.js FILENAME");
            }
        });
    };

    authenticateNeverBounce();
}());