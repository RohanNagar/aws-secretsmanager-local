const ArgumentParser = require('argparse').ArgumentParser;
const express = require('express');
const process = require('process');

process.on('SIGINT', () => {
  console.info("Interrupted, exiting.");
  process.exit(0);
})

// -- Add command line args --
const parser = new ArgumentParser({
  add_help:    true,
  description: 'A mock version of AWS Secrets Manager'
});

parser.add_argument('-v', '--version', {
  action:  'version',
  version: '1.0.0'
});

parser.add_argument('definedSecrets', {
  metavar: 'SECRET:VALUE',
  help:    'A list of pre-defined secrets and their values',
  nargs:   '*'
});

parser.add_argument('-p', '--port', {
  help:    'The port to run on',
  type:    'int',
  default: 4555
});

const args = parser.parse_args();

// -- Create secrets map and add predefined secrets --
let secrets = {};

// Add from env variables
if (process.env.SECRETSMANAGER_SECRETS) {
  process.env.SECRETSMANAGER_SECRETS.split(',').forEach(pair => {
    secrets[pair.split(':')[0]] = pair.split(':')[1];
  });
}

// Add from command line args
args.definedSecrets.forEach(secret => {
  secrets[secret.split(':')[0]] = secret.split(':')[1];
})

console.log(secrets);

// -- Set up the API --
const app = express();

app.use(express.json({ type: 'application/x-amz-json-1.1' }));

app.post('/', (req, res) => {
  // Make sure we have the right header
  if (typeof req.header('X-Amz-Target') === 'undefined' || req.header('X-Amz-Target') === null) {
    res.status(400).send('Missing X-Amz-Target header');
    return;
  }

  // GetSecretValue
  if (req.header('X-Amz-Target') === 'secretsmanager.GetSecretValue') {
    if (!req.body.SecretId) {
      res.status(400).send('Missing SecretId in the request');
      return;
    }

    console.log(`Received GetSecretValue request for id ${req.body.SecretId}`);

    if (!secrets[req.body.SecretId]) {
      res.status(404).send(`Secret ${req.body.SecretId} not found.`);
      return;
    }

    res.status(200).send({
      SecretString: secrets[req.body.SecretId]
    });
    return;
  }
});

// Start the app
app.listen(args.port, (err) => {
  if (err) {
    return console.log('Error starting aws-secretsmanager-local!', err);
  }

  console.log(`aws-secretsmanager-local started on port ${args.port}`);
});

