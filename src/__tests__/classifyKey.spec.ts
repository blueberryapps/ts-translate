import { classifyKey } from '../classifyKey';

it('should convert key path to class name', () => {
  expect(classifyKey('en.foo.bar')).toEqual('cnt-en-foo-bar');
  expect(classifyKey('en.foo bar')).toEqual('cnt-en-foo-bar');
  expect(classifyKey('en.Foo Bar')).toEqual('cnt-en-foo-bar');
  expect(classifyKey('en foo...bar')).toEqual('cnt-en-foo-bar');
  expect(classifyKey('en f00...bar')).toEqual('cnt-en-f00-bar');
});
