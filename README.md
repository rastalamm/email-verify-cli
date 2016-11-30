# CLI tool to verify valid email addresses

**Current version works with Mailbox Layer only (you can manually change to verify via NeverBounce but need to authenticate prior to running step 3)**

##### Follow below steps for this to work
1. Register for a free account at either/both [Neverbounce](https://neverbounce.com/) or [MailboxLayer](https://mailboxlayer.com/)

2. Create `apiKeys.js` file in root of project that
A. Contains your credentials
B. Exports your credentials according to below format

```
module.exports = {
    neverbounce: {
        username: "L4z9jrv7",
        key: "QIXTns7qd6mz%hF"
    },
    mailboxLayer: {
        key: "50876c1a3fbd794d4841a3fd9e38ec92"
    }
};
```
3. Run `$ node check.js FILENAME` and wait for the results **


** Things to consider
* FILENAME should be located in `/desktop` and include the .csv extension => `emailList.csv`
* The output will be written to `/desktop` as `FILENAME`+ `Results.csv` => `emailListResults.csv`
* To authenticate with NeverBounce, make sure you include your username and key in the apiKeys.js file. Run `$ node authenticate.js`