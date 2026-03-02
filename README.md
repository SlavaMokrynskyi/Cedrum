# Cedra Web Wallet

## Setup

**A. Extension**
1. `npm run build`
2. In Chrome, go to [chrome://extensions/](chrome://extensions/)
3. Enable developer mode
4. Hit `Load Unpacked` and point to new `build` folder in `web-wallet` directory

*You can create a new wallet or use already made, recovery phrase and password you can find in /password.txt*

**B. Webpage**
1. `npm run start`

## Linting
```bash
# Autofix all linting issues
npm run lint -- --fix
```

## Project structure

- `src/core` - shared wallet logic: UI components, hooks, layouts, queries, mutations, utils, types, images and theme styles.
- `src/pages` - route-level pages that compose `core` components into extension screens.
- `src/scripts` - extension runtime scripts: background, inpage, popup helpers and sidepanel-related logic.
- `public` - static extension entry files and assets copied directly into the final build.
- `build` - generated production bundle for the Chrome extension after `npm run build`.
- `vite.config.mts`, `webpack.scripts.config.js`, `webpack.sidepanel.config.js` - build configuration for app UI, background scripts and sidepanel bundle.
