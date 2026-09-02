# @kno2/ccdaview

An Angular library for exploring C-CDA clinical documents. `CdaExplorerComponent` parses a CDA document and renders its header, patient demographics, and narrative sections with expand/collapse, jump-to navigation, and per-document-type section preferences persisted to `localStorage`.

This is a ground-up Angular rewrite that replaced the original riot.js viewer (sialia) and its bluebutton.js parser.

## Usage

```html
<kno2-cda-explorer [content]="xmlString" />
```

The host application must provide:

- PrimeNG 22 with a configured theme (`providePrimeNG`)
- Font Awesome 4 icon classes (`fa fa-*`)

Peer dependencies: `@angular/common`, `@angular/core`, `@angular/forms`, `@angular/cdk`, `primeng`.

## Development

Requires the Node version in `.nvmrc` and access to the `@kno2` npm scope.

```
npm install
npm start          # demo app at http://localhost:4200
npm run build      # builds the library to dist/ccdaview
npm run test:ci    # vitest suite
npm run lint
npm run format
```

The demo app loads the sample documents in `docs/` and needs a PrimeNG license key in a `.env` file at the repo root:

```
CCDAVIEW_PRIMENG_LICENSE=<license key>
```

## Publishing

Publishing happens from CI when a GitHub release is created; the release tag becomes the npm version of the built package in `dist/ccdaview`.
