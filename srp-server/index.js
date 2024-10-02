const srp = require('secure-remote-password/server');
const client = require('secure-remote-password/client');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3000;

const database = {

};

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/register', function (req, res) {
    const { username, salt, verifier } = req.body;

    database['username'] = username;
    database['salt'] = salt;
    database['verifier'] = verifier;

    res.send({message: "Registered"});
});

app.post('/init-login', function (req, res) {
    const { username, ephemeral } = req.body;
    
    const serverEphemeral = srp.generateEphemeral(database.verifier);

    database['clientEphemeral'] = ephemeral;
    database['serverEphemeral'] = serverEphemeral.secret;

    let salt = database.username !== username ? client.generateSalt() : database['salt'];

    res.send({
        salt: salt,
        ephemeral: serverEphemeral.public
    });
});

app.post('/finalize-login', function (req, res) {
    const { proof } = req.body;
    const { serverEphemeral, clientEphemeral, salt, username, verifier } = database;

    const serverSession = srp.deriveSession(serverEphemeral, clientEphemeral, salt, username, verifier, proof);

    res.send({
        proof: serverSession.proof
    })
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})