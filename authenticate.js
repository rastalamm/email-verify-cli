(function () {
    "use strict";
    const Promise = require('bluebird');
    const request = Promise.promisify(require('request'));
    const neverBounceApiKeys = require('./apiKeys.js').neverbounce;
    const apiUsername = neverBounceApiKeys.username;
    const apiSecretKey = neverBounceApiKeys.key;

    const authenticateNeverBounce = function () {
        return request({
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
        })
            .then(function (response) {
                if (response.statusCode !== 200) {
                    console.error(`Received a ${response.statusCode} error. \n ${response.body}`);
                } else {
                    console.log("You're all set! Time to start validating emails");
                    console.log("Type in: \n node check.js FILENAME");
                }
            })
            .catch(console.error);
    };

    authenticateNeverBounce();
}());