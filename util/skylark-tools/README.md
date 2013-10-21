# Skylark Tools
A suite of supporting command-line tools and Grunt tasks for the Skylark Framework.

## base64
Encode a file using base64 encoding.

Usage:
```
skt base64 path/to/file.png
```
Generates `path/to/file.png.base64`

## grunt-utils.js

A collection of helper methods that are used both in Skylark itself
and in projects created with `generator-skylark` to enable code-sharing
and reuse.

    module.exports = function(grunt) {
        var utils = require('skylark-tools').utils(grunt);

        grunt.initConfig(config);

        utils.overrideConfig('gruntfile-config.json');
        utils.userScript('gruntfile-user.js');
        utils.configureMinifier();

        ...

## Experimental

These tools were used internally during the development of Skylark. They
are most likely **not** fit for usage in any of your scenarios.

### as2ts

Assist in converting AS3 files to TypeScript

### tounderscore

Convert class member variables from 'S_' style (`mMyVar`) to 'Skylark` style (`_myVar`)
```
skt tounderscore path/to/file.ts
```
