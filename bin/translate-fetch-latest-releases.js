#! /usr/bin/env node
const listReleases = require('../lib/tasks/listReleases').default;
const fetchRelease = require('../lib/tasks/fetchRelease').default;

const demandOptions = ['releasesDir']
if (!process.env.TRANSLATE_API_URL) {
  demandOptions.push('apiUrl')
}
if (!process.env.TRANSLATE_API_TOKEN) {
  demandOptions.push('apiToken')
}

const argv = require('yargs')
  .usage('Usage: \n$0 --apiUrl [http://translations.blueberry.io] --releasesDir ./localization/releases --apiToken [XXXXXX]')
  .demandOption(demandOptions)
  .argv;

const config = {
  apiUrl: argv.apiUrl || process.env.TRANSLATE_API_URL,
  apiToken: argv.apiToken || process.env.TRANSLATE_API_TOKEN,
  releasesDir: argv.releasesDir
}

console.log('Fetching latest releases from Translation server with config:');
console.log(JSON.stringify(config, null, 2));

listReleases(config).then(locales => {
  Object.keys(locales).forEach(locale => {
    const releases = locales[locale];
    if (releases.length > 0) {
      const version = releases[releases.length - 1].version
      console.log(`DOWNLOADING RELEASE ${version} FOR LOCALE: ${locale}`);
      fetchRelease(config, version).catch(e => console.error(e))
    } else {
      console.warn(`LOCALE: ${locale} HAS NO RELEASES YET`)
    }
  })
}).catch(e => console.error(e))
