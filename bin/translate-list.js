#! /usr/bin/env node
const listReleases = require('../lib/tasks/listReleases').default;

const demandOptions = []
if (!process.env.TRANSLATE_API_URL) {
  demandOptions.push('apiUrl')
}
if (!process.env.TRANSLATE_API_TOKEN) {
  demandOptions.push('apiToken')
}

const argv = require('yargs')
  .usage('Usage: \n$0 --apiUrl [http://translations.blueberry.io] --apiToken [XXXXXX]')
  .demandOption(demandOptions)
  .argv;

const config = {
  apiUrl: argv.apiUrl || process.env.TRANSLATE_API_URL,
  apiToken: argv.apiToken || process.env.TRANSLATE_API_TOKEN
}

console.log('Fetching list of releases from Translation server with config:');
console.log(JSON.stringify(config, null, 2));

listReleases(config).then(locales => {
  Object.keys(locales).forEach(locale => {
    console.log('LOCALE: ', locale);
    const releases = locales[locale];
    releases.forEach(release => {
      console.log([
        '  - ',
        release.version,
        '(',
        release.created_at,
        ')-> yarn translate-fetch --version',
        release.version,
        !process.env.TRANSLATE_API_TOKEN && '--apiToken',
        !process.env.TRANSLATE_API_TOKEN && config.apiToken,
        !process.env.TRANSLATE_API_URL && '--apiUrl' ,
        !process.env.TRANSLATE_API_URL && config.apiUrl
      ].filter(o => !!o).join(' '))
    })
  })
}).catch(e => console.error(e))
