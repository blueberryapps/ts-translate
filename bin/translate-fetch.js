#! /usr/bin/env node
const fetchRelease = require('../lib/tasks/fetchRelease').default;

const demandOptions = ['releasesDir']
if (!process.env.TRANSLATE_API_URL) {
  demandOptions.push('apiUrl')
}
if (!process.env.TRANSLATE_API_TOKEN) {
  demandOptions.push('apiToken')
}

const argv = require('yargs')
  .usage('Usage: \n$0 --version [en_v001] --releasesDir ./localization/releases --apiUrl [http://translations.blueberry.io] --apiToken [XXXXXX]')
  .demandOption(demandOptions)
  .argv;

const config = {
  apiUrl: argv.apiUrl || process.env.TRANSLATE_API_URL,
  apiToken: argv.apiToken || process.env.TRANSLATE_API_TOKEN,
  releasesDir: argv.releasesDir,
}

console.log('Fetching release `' + argv.version + '` from Translation server with config:');
console.log(JSON.stringify(config, null, 2));

fetchRelease(config, argv.version)
  .then(result => {

  })
  .catch(e => console.error(e))
