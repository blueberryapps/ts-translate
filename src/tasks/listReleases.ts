import api from '../api';
import { ApiConfig, Releases, ReleaseVersion } from '../types';

export default async function listReleases(config: ApiConfig) {
  console.log(`Listing releases from ${config.apiUrl}`); // eslint-disable-line no-console
  const { releases } = await api(config, 'GET', config.apiEndpoint!);

  const localeVersions = releases
    .reduce((out: Releases, release: ReleaseVersion) => ({ ...out, [release.locale]: (out[release.locale] || []).concat(release) }), {});

  return localeVersions;
}
