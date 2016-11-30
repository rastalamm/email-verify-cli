(function () {
    "use strict";

    const Promise = require('bluebird');
    const csv = require('fast-csv');
    const json2csv = Promise.promisify(require('json2csv'));
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const writeFile = Promise.promisify(fs.writeFile);
    const Validators = require('./Validators.js');

    const desktop = path.join(os.homedir(), "Desktop");
    const fileName = process.argv.slice(2).shift();
    const filePath = path.join(desktop, fileName);
    const validationServiceInput = process.argv.slice(3).shift();

    const compileListOfEmailsToValidate = () => {
        const emailFileStream = fs.createReadStream(filePath);
        let emails = [];

        return new Promise(function(resolve, reject) {
            csv
                .fromStream(emailFileStream)
                .on('data', function(data) {
                    if (data.length > 0) {
                        emails.push(data.shift());
                    }
                })
                .on('end', function() {
                    resolve(emails);
                });
            });
    };

    const validationServiceLookup = (validationServiceInput) => {
        if (validationServiceInput == "nb") {
            return Validators.neverBounceValidator;
        }

        if (validationServiceInput == "mbl") {
            return Validators.mailboxLayerValidator;
        }

        throw new Error(`Can't find a validation service for ${validationServiceInput}`);
    };


    const formatToCsv = (data, fields) => json2csv({data, fields});

    const writeCsvFile = function (fileName, csvData) {
        const fileOutput = path.join(desktop, fileName);

        return writeFile(fileOutput, csvData)
            .then(function () {
                console.log(`The ${fileName} was created ${fileOutput}`);
            })
            .catch(function (error) {
                console.error(`There was an error with creating the ${fileName}`, error);
            });
    };

    const sendEmailsToValidationService = function (emails, validator) {

        console.log("Checking Emails", emails);
        console.log("Total emails to check", emails.length);
        console.log("Checking emails....");

        let totalEmails = emails.length;

        return Promise.mapSeries(emails, function (email) {
            console.log('Emails remaining', totalEmails);
            totalEmails = totalEmails - 1;

            return validator.validate(email);
        });
    };


    const validateEmails = function (filePath, validationService) {
        const validator = validationServiceLookup(validationService);

        return compileListOfEmailsToValidate(filePath)
            .then(function (emails){
                if (emails.length < 1) {
                    throw `Can't find any emails in ${filePath}`;
                }

                return sendEmailsToValidationService(emails, validator);
            })
            .then(function (results) {

                console.log("Done checking emails.");
                return formatToCsv(results, validator.csvFields);
            })
            .then(function (csv) {
                const resultFileName = fileName.replace('.csv', 'Results.csv');

                writeCsvFile(resultFileName, csv);
            })
            .catch(console.error)
    };


    validateEmails(filePath, validationServiceInput);
}());