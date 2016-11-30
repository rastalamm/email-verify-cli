(function () {
    "use strict";

    const Promise = require('bluebird');
    const apiUsername = require('./apiKeys.js').neverbounce.username;
    const apiSecretKey = require('./apiKeys.js').neverbounce.key;
    const csv = require('fast-csv');
    const fs = require('fs');
    const json2csv = Promise.promisify(require('json2csv'));
    const mailboxLayerAccessKey = require('./apiKeys.js').mailboxLayerJudahLamm.key;
    // const mailboxLayerAccessKey = require('./apiKeys.js').mailboxLayerJudahSkillSilo.key;
    // const mailboxLayerAccessKey = require('./apiKeys.js').mailboxLayerJoshSkillSilo.key;
    const NeverBounce = require('neverbounce')({
        apiKey: apiUsername,
        apiSecret: apiSecretKey
    });
    const os = require('os');
    const path = require('path');
    const request = Promise.promisify(require('request'));
    const writeFile = Promise.promisify(fs.writeFile);
    const desktop = path.join(os.homedir(), "Desktop");
    const fileName = process.argv.slice(2).shift();
    const filePath = path.join(desktop, fileName);

    const neverBounceValidate = function (email) {
        return NeverBounce.single.verify(email).then(
            function (result) {
                return {
                    email: email,
                    status: result.getResultTextCode(),
                    statusCode: result.getResult()
                };
            },
            function (error) {
                console.error("errors", error);
            }
        );
    };

    const mailboxLayerValidate = function (email) {
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

    const formatToCsv = function (data, fields) {
        return json2csv({
            data,
            fields
        });
    };

    const writeCsvFile = function (fileName, csvData) {
        const fileOutput = path.join(desktop, fileName);

        writeFile(fileOutput, csvData)
            .then(function () {
                console.log(`The ${fileName} was created ${fileOutput}`);
            })
            .catch(function (error) {
                console.error(`There was an error with creating the ${fileName}`, error);
            });
    };

    const validateEmails = function (filePath) {
        const stream = fs.createReadStream(filePath);
        let emails = [];

        csv
            .fromStream(stream)
            .on("data", function (data) {
                if (data.length > 0) {
                    emails.push(data.shift());
                }
            })
            .on("end", function () {
                console.log("Checking Emails", emails);
                console.log("Total emails to check", emails.length);
                console.log("Checking emails....");

                let emailLength = emails.length;

                return Promise.mapSeries(emails, function (email) {
                    console.log('Emails remaining', emailLength);
                    emailLength = emailLength - 1;

                    // return neverBounceValidate(email);
                    return mailboxLayerValidate(email);
                }).then(function (results) {
                    // const csvFieldsNEverBounce = ["email", "status", "statusCode"];
                    const csvFieldsMailboxLayer = ["email", "did_you_mean", "user", "domain", "format_valid", "mx_found", "smtp_check", "catch_all", "role", "disposable", "free", "score"];


                    console.log("DONE!");
                    return formatToCsv(results, csvFieldsMailboxLayer);
                }).then(function (csv) {
                    const resultFileName = fileName.replace('.csv', 'Results.csv');

                    writeCsvFile(resultFileName, csv);
                });
            });
    };

    validateEmails(filePath);
}());