# Development howto

## Build

```
$ cd src
$ npm install # install dependencies
$ grunt firefox
$ grunt chrome
```

## Test

```
$ cd src
$ npm test
```

## Release a beta version

```
$ cd src
$ npm version preminor
$ grunt firefox
$ grunt chrome
```

### Release second beta version

```
$ cd src
$ npm version prerelease
$ grunt firefox
$ grunt chrome
```

## External resources

Icons from https://icomoon.io
