import * as nock from 'nock';
import listReleases from '../listReleases';

describe('listReleases()', () => {
  const config = { apiToken: 'X', apiUrl: 'http://translation.cz' };
  nock('http://translation.cz', {
    reqheaders: {
      Authorization: 'Token token=X',
      'Content-type': 'application/json',
    },
  }).get('/api/v1/releases')
    .reply(200, {
      releases: [
        {
          locale: 'cs',
          version: 'cs_v001',
          created_at: '2016-07-08T11:22:57.866Z',
        },
        {
          locale: 'cs',
          version: 'cs_v002',
          created_at: '2016-07-08T11:22:57.882Z',
        },
        {
          locale: 'en',
          version: 'en_v001',
          created_at: '2016-07-08T11:22:57.888Z',
        },
      ],
    });

  it('calls API', async () => {
    const result = await listReleases(config);

    expect(result).toEqual({
      cs: [{
        locale: 'cs',
        version: 'cs_v001',
        created_at: '2016-07-08T11:22:57.866Z',
      }, {
        locale: 'cs',
        version: 'cs_v002',
        created_at: '2016-07-08T11:22:57.882Z',
      }],
      en: [{
        locale: 'en',
        version: 'en_v001',
        created_at: '2016-07-08T11:22:57.888Z',
      }],
    });
  });
});
