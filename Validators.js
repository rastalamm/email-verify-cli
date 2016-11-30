"use strict"
const Promise = require('bluebird');
const apiKeys = require('./apiKeys.js');
const NeverBounce = require('neverbounce');
const request = Promise.promisify(require('request'));

const mailboxLayerValidationApiCall = function (email) {
    const mailboxLayerAccessKey = apiKeys.mailboxLayer.key;
    const mailboxLayerUrl = `http://apilayer.net/api/check`;
    const url = `${mailboxLayerUrl}?access_key=${mailboxLayerAccessKey}&email=${email}`;

    return request({
        url: url,
        json: true
    })
        .then(function (response) {
            return {
                email: response.body.email,
                did_you_mean: response.body.did_you_mean,
                user: response.body.user,
                domain: response.body.domain,
                format_valid: response.body.format_valid,
                mx_found: response.body.mx_found,
                smtp_check: response.body.smtp_check,
                catch_all: response.body.catch_all,
                role: response.body.role,
                disposable: response.body.disposable,
                free: response.body.free,
                score: response.body.score
            };
        });
};

const neverBounceValidationApiCall = function (email) {
    const neverBounceApiKey = apiKeys.neverbounce;
    const nb = NeverBounce({
        apiKey: neverBounceApiKey.username,
        apiSecret: neverBounceApiKey.key
    });

    return nb.single.verify(email)
        .then(function (result) {
                return {
                    email: email,
                    status: result.getResultTextCode(),
                    statusCode: result.getResult()
                };
            },
            function (error) {
                throw error;
            }
        );
};

const mailboxLayerValidator = {
    validate: mailboxLayerValidationApiCall,
    csvFields: ["email", "did_you_mean", "user", "domain", "format_valid", "mx_found", "smtp_check", "catch_all", "role", "disposable", "free", "score"]
};

const neverBounceValidator = {
    validate: neverBounceValidationApiCall,
    csvFields: ["email", "status", "statusCode"]
};

module.exports = {
    mailboxLayerValidator,
    neverBounceValidator
};