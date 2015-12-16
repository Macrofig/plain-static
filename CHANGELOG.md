# Changelog

## [1.3.1] - 2015-12-16

## Changed

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
