// Metro configuration for a repo where the app lives alongside shared packages.
//
// The mobile app deliberately installs its own dependencies rather than sharing
// the root install: React Native pins React 18 while the Next.js dashboard needs
// React 19, and a single hoisted copy of React cannot satisfy both. The cost is
// this file — Metro has to be told to look outside the app directory for
// @zoned/core.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the shared package so edits to @zoned/core hot-reload in the app.
config.watchFolders = [path.resolve(workspaceRoot, 'packages/core')];

config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];
// Without this, a symlinked package can pull in a second copy of React.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
