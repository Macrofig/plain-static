# Changelog

## [1.5.1] - 2016-04-19

### Changed

- Now using config options in Watch script.
- Improved error handling of JSON parsing.

## [1.5.0] - 2016-02-11

### Added

- Created global.json/js. The data is extended to every other data file and can be found at `_global`. (Needed for persistent properties like a nav object.)

## [1.4.4] - 2016-01-15

### Changed

- Updated watch to properly use build methods
- Fixed logic issue when compiling Less files

## [1.4.3] - 2016-01-03

### Added

- Added targetFiles option, used to narrow down specific files in src directory to process.

### Changed

- Glob patterns new rely on new targetFiles option to search in deep folders.

## [1.4.2] - 2015-12-28

### Added

- Added plain text demo files

### Changed

- Updated demo so it demos the copyFiles method
- Fixed parsing of markdown files when multiples exist nested in single JSON/JS object.
- Cleaned up namespacing of debug statements.

## [1.4.0] - 2015-12-24

### Added

- Main build script and copy methods now return promises
- Copy files method that copies files based on pattern. Preserves folder structure.

### Removed

- Removed images copy method

## [1.3.1] - 2015-12-16

### Changed

- Fixed markdown content being attached to incorrect data object
- Fixed data being built needlessly by watch

## [1.3.0] - 2015-12-16

### Added

- Added `_meta` property that contains additional static (not derived from content) properties
- Added `today`, current unix time stamp, to `_meta`.
- Ability to read JavaScript files for properties. Needed to create Mustache helpers.

## [1.2.0] - 2015-12-16

### Added

- Added `prepublish` script that runs lint and test tools before publishing to npm
- Added less example to demo.
- Added folder structure example to demo

### Changed

- Improved notes in readme file.
- Tool now respects source folder structure

## [1.1.0] - 2015-12-16

### Added

- Added watch trigger to main index

### Changed

- Wrapped watch script so it can be called when needed

## [1.0.0] - 2015-12-15

### Added

- Added description and repo to package.json
- Added ability to define app root

### Changed

- Improved dependencies
- Fixed remaining XO errors

## [0.1.0] - 2015-12-15

### Created

- Created repo
- Copied files from side project where this was originally created

[1.1.0]: https://github.com/Macrofig/plain-static/releases/tag/v1.1.0
[1.0.0]: https://github.com/Macrofig/plain-static/releases/tag/v1.0.0
[0.1.0]: https://github.com/Macrofig/plain-static/releases/tag/v0.1.0
