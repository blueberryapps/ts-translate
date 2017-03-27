import * as fetch from 'isomorphic-fetch';
import * as url from 'url';
import { ApiConfig, ApiMethod, ApiEndpoint, ApiData } from './types';

export function apiUrlResolve(apiUrl: string, endpoint: ApiEndpoint) {
  return url.resolve(apiUrl, endpoint);
}

/**
 * Action for updating locale messages
 * @param {Object}  config   configuration options (apiUrl, apiToken)
 * @param {String}  method   http method which to use for call
 * @param {String}  endpoint enpoint string name
 * @param {Object}  data     object which gets serialized to JSON and then send as body
 * @return {Object}          declared action
 */
export default async function api(config: ApiConfig, method: ApiMethod, endpoint: ApiEndpoint, data?: ApiData) {
  const apiUrl = apiUrlResolve(config.apiUrl || '', endpoint);
  let response;

  try {
    response = await fetch(apiUrl, {
      method,
      credentials: 'include',
      headers:     {
        'Content-type': 'application/json',
        Authorization: `Token token=${config.apiToken}`
      },
      body: data ? JSON.stringify(data) : null
    });
  } catch (e) {
    console.error(`TRANSLATE: Trying to execute API Call to ${config.apiUrl} ${method}:${apiUrl} with data ${JSON.stringify(data || {})} but got: ${e.message}`);  // eslint-disable-line no-console
    return {};
  }

  if (/[23]\d{2}/.test(response.status.toString()))
    return await response.json();

  throw new Error(`Invalid response status code: ${response.status} for ${method}:${apiUrl} with data ${JSON.stringify(data || {})}`);
}
