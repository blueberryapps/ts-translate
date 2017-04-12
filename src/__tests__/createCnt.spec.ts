import { createCnt, memoizeCreateCnt } from '../createCnt';

const benchmark = (fn: (i: number) => void): number => {
  const start = new Date();
  for (let i = 0; i < 20000 ; i ++) {
    fn(i);
  }

  return (new Date().getTime() - start.getTime()) as number;
};

const memoizedCreateCntSame = memoizeCreateCnt(createCnt);
const normalFn = () => createCnt('en.foo.bar', 'result');
const memoizedFn = () => memoizedCreateCntSame('en.foo.bar', 'result');
const fasterByX = 5;

const memoizedCreateCntSeq = memoizeCreateCnt(createCnt);
const normalFnSeq = (i: number) => createCnt(`en.foo.bar.${i}`, 'result');
const memoizedFnSeq = (i: number) => memoizedCreateCntSeq(`en.foo.bar.${i}`, 'result');

it('memoized version should be faster for same call', () => {
  expect(
    benchmark(memoizedFn),
  ).toBeLessThan(benchmark(normalFn) / fasterByX);
});

it('memoized version should be slower for different calls', () => {
  expect(
    benchmark(memoizedFnSeq),
  ).toBeGreaterThan(benchmark(normalFnSeq));
});
