import * as fs from 'fs';
import * as nock from 'nock';
import * as path from 'path';
import fetchRelease from '../fetchRelease';

describe('fetchRelease()', () => {
  const releasesDir = path.join(__dirname, 'test_fetch_release');
  const config = { apiToken: 'X', apiUrl: 'http://translation.cz', apiEndpoint: 'api/v1/releases', releasesDir };

  // afterEach(() => {
  //   try {
  //     fs.accessSync(path.join(releasesDir, 'cs.json'), fs['F_OK']);
  //   } catch (e) {
  //   }
  // });
  
  nock('http://translation.cz', {
    reqheaders: {
      Authorization: 'Token token=X',
      'Content-type': 'application/json',
    },
  }).get('/api/v1/releases/cs_v001.json')
    .reply(200, { cs: { foo: 'Bar' } });

  nock('http://translation.cz', {
    reqheaders: {
      Authorization: 'Token token=X',
      'Content-type': 'application/json',
    },
  }).get('/api/v1/releases/unknown_v001.json')
    .reply(404, {
      errors: 'Not Found',
      message: 'Release could not be found by version: unknown_v001',
    });

  it('calls API with know version', async () => {
    const result = await fetchRelease(config, 'cs_v001');
    expect(result).toEqual({ cs: { foo: 'Bar' } });

    const result2 = JSON.parse(fs.readFileSync(path.join(releasesDir, 'cs.json')).toString());
    const source = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixture_cs.json')).toString());
    expect(result2).toEqual(source);
  });

  it('throw error without config releasesDir', async () => {
    try {
      await fetchRelease({}, 'unknown_v001');
      expect(true).toBeFalsy();
    } catch (e) {
      expect(e.message).toContain('Missing');
    }
  });

  it('throw error without existing releasesDir', async () => {
    try {
      await fetchRelease({ releasesDir: path.join(process.cwd(), 'unknownDirectory') }, 'unknown_v001');
      expect(true).toBeFalsy();
    } catch (e) {
      expect(e.message).toContain('Cannot continue:');
    }
  });

  it('throw error on call API without version', async () => {
    try {
      await fetchRelease(config, 'unknown_v001');
      expect(true).toBeFalsy();
    } catch (e) {
      expect(e.message).toContain('404');
    }
  });
});
