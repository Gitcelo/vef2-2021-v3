module.exports = {
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    // Viljum frekar named exports
    'import/prefer-default-export': 0,

    // Verðum að hafa extensions út af es modules
    'import/extensions': 0,

    // Skilgreinum að þetta sé rótin í verkefninu okkar, þar sem það er annað
    // package.json skjal í ./src
    'import/no-extraneous-dependencies': ['error', { packageDir: './' }],

    'import/no-cycle': 0,

    //Leyfa underscore
    'no-underscore-dangle': "off",

    'no-await-in-loop': "off",

    // Leyfum console.info, warn og error
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
  },
};
