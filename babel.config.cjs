module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    // Transform import.meta for Jest compatibility
    [
      'babel-plugin-transform-import-meta',
      {
        module: 'ES6',
      },
    ],
  ],
};
