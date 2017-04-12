import * as fs from 'fs';
import * as path from 'path';
import api from '../api';
import { ApiConfig, Version } from '../types';

export default async function fetchRelease(config: ApiConfig, version: Version) {
  if (!config.releasesDir) {
    throw new Error('Missing releasesDir in config');
  }

  try {
    // tslint:disable-next-line:no-string-literal
    fs.accessSync(config.releasesDir, fs['F_OK']);
  } catch (e) {
    throw new Error(`Cannot continue: 'releasesDir'='${config.releasesDir}' does not exist`);
  }

  console.log(`Downloading release ${version} from ${config.apiUrl}`);
  const locale = version.split('_').slice(0, -1).join('_');
  const releases = await api(config, 'GET', `/api/v1/releases/${version}.json`);
  const releaseFile = path.join(config.releasesDir, `${locale}.json`);

  fs.writeFileSync(releaseFile, `${JSON.stringify(releases, null, 2)}\n`);

  console.log(`Release ${version} written to ${releaseFile}`);

  return releases;
}
