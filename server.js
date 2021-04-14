const express = require('express')

const app = express()
const port = 9000

let secrets = {};
secrets["BASIC_AUTH_PASSWORD"] = "secret";

app.use(express.json({ type: 'application/x-amz-json-1.1' }));

app.post('/', (req, res) => {
  if (req.header('X-Amz-Target') === 'secretsmanager.GetSecretValue') {
    console.log(req.body);
    console.log(req.body.SecretId);
    console.log(secrets[req.body.SecretId]);

    if (!req.body.SecretId) {
      res.status(400).send('Missing SecretId in the request');
      return;
    }

    if (!secrets[req.body.SecretId]) {
      res.status(404).send(`Secret ${req.body.SecretId} not found.`);
      return;
    }

    let response = {
      SecretString: secrets[req.body.SecretId]
    };

    res.status(200).send(response);
    return;
  }

  res.status(400).send('Missing X-Amz-Target header');
});

app.listen(port, (err) => {
  if (err) {
    return console.log('Error starting.', err);
  }

  console.log(`server is listening on ${port}`);
});

