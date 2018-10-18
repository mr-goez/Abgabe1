import * as rimraf from 'rimraf'

// tslint:disable-next-line:no-empty
const noop = (_: Error) => {}

rimraf('dist', noop)
rimraf('server.*', noop)
