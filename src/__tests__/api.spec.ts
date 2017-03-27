import { apiUrlResolve } from '../api';

describe('apiUrlResolve', () => {
  const url = 'http://translation.cz';
  const urlWithSlash = 'http://translation.cz/';

  it('resolves correct /endpoint', () => {
    expect(apiUrlResolve(url, '/changes')).toEqual('http://translation.cz/changes');
    expect(apiUrlResolve(url, '/changes')).toEqual('http://translation.cz/changes');
    expect(apiUrlResolve(urlWithSlash, '/changes')).toEqual('http://translation.cz/changes');
    expect(apiUrlResolve(urlWithSlash, 'changes')).toEqual('http://translation.cz/changes');
  });
});
