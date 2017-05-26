import { fromJS } from 'immutable';
import { __isSplittableKey, __structureObject, createStructuredJSON } from '../structuredJSON';

const flatMap = fromJS({
  'en.views.homepage.title': 'Welcome',
});

const structuredMap = {
  en: {
    views: {
      homepage: {
        title: 'Welcome',
      },
    },
  },
};

const structuredImmutableMap = fromJS({
  en: {
    views: {
      homepage: {
        title: 'Welcome',
      },
    },
  },
});

const hybrid = fromJS({
  en: {
    'views.homepage.title': 'Welcome',
  },
  es: {
    'views.homepage.title': 'Bueno',
  },
});

const structured = fromJS({
  en: {
    views: {
      homepage: {
        title: 'Welcome',
      },
    },
  },
  es: {
    views: {
      homepage: {
        title: 'Bueno',
      },
    },
  },
});

describe('creating structed JSON objects', () => {
  it('should create structed object from complete flatmap', () => {
    expect(createStructuredJSON(flatMap)).toEqual(structuredImmutableMap);
  });

  it('should create structed object from hybrid JSON', () => {
    expect(createStructuredJSON(hybrid)).toEqual(structured);
  });

  it('should not change already structured object', () => {
    expect(createStructuredJSON(structured)).toEqual(structured);
  });
});

describe('structureObject', () => {
  it('should construct objects from array of keys', () => {
    expect(__structureObject(['en', 'views', 'homepage', 'title'], 'Welcome')).toEqual(structuredMap);
  });

  it('should return empty object for empty array of keys', () => {
    expect(__structureObject([], 'foo')).toEqual({});
  });
});

describe('isSplittableKey', () => {
  it('should say "en.views.homepage" is splittable key', () => {
    expect(__isSplittableKey('en.views.homepage')).toBe(true);
  });

  it('should say "Lorem ipsum. Dolor sit amet." is not splittable key', () => {
    expect(__isSplittableKey('Lorem ipsum. Dolor sit amet.')).toBe(false);
  });

  it('should say "Fin." is not splittable key', () => {
    expect(__isSplittableKey('Fin.')).toBe(false);
  });
});
