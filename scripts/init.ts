// in Anlehnung an das Beispielprojekt

import * as fs from 'fs-extra'
import * as path from 'path'

import {dir} from './shared'

const {src, config, dist} = dir

// /* eslint-disable no-console */
// // JSON-Dateien kopieren
// const jsonSrc = path.join(src, 'auth', 'service', 'json')
// const jsonDist = path.join(dist, 'auth', 'service', 'json')
// fs.copy(jsonSrc, jsonDist, err => {
//     if (err) {
//         return console.error(err)
//     }
// })

// // PEM-Dateien fuer JWT kopieren
// const jwtPemSrc = path.join(src, 'auth', 'service', 'jwt')
// const jwtPemDist = path.join(dist, 'auth', 'service', 'jwt')
// fs.copy(jwtPemSrc, jwtPemDist, err => {
//     if (err) {
//         return console.error(err)
//     }
// })

// PEM- und Zertifikatdateien fuer HTTPS kopieren
const httpsSrc = path.join(config, 'https')
const httpsDist = path.join(dist, 'shared', 'config')
fs.copy(httpsSrc, httpsDist, err => {
    if (err) {
        return console.error(err)
    }
})

// Konfig-Dateien fuer Nodemon kopieren
const nodemonSrc = path.join(config, 'nodemon')
fs.copy(nodemonSrc, dist, err => {
    if (err) {
        return console.error(err)
    }
})
