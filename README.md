# Confidant-Js

Multi platform scalable environment variables manager

[https://www.npmjs.com/package/confidant-js](https://www.npmjs.com/package/confidant-js)

## Installation
```sh
npm install confidant-js
```

## Usage
```js
import Confidant from "confidant-js";

const confidant = new Confidant();
console.log(confidant.credentials);
```

## Compile Typescript

For Development
```sh
npx tsc --watch
```

For Production
```sh
npm run build
```

## Publish to npm
### Login to npm
```sh
npm login
```
### Publish the Package
```sh
npm publish --access public
```
### Install and Test
```sh
npm install confidant-js
```

### Updating the Package
To update confidant-js:

Bump the version in package.json (e.g., 0.1.1).

Run:

```sh
npm publish --access public
```