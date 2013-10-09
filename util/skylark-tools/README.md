Tools accomagnying StarlingJS

## base64
Encode a file using base64 encoding.

Usage:
```
skt base64 path/to/file.png
```
Generates `path/to/file.png.base64`

## as2ts

Assist in converting AS3 files to TypeScript

## tounderscore

Convert class member variables from 'Starling' style (`mMyVar`) to 'Skylark` style (`_myVar`)
```
skt tounderscore path/to/file.ts
```

## grunt-utils.js

```
var utils = require('skylark-tools').utils(grunt);
utils.configureMinifier();
```

