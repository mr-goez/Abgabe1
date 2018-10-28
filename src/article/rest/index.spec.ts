// tslint:disable:no-unused-expression max-file-line-count
import * as chai from 'chai'
import { AddressInfo } from 'net'
import * as request from 'supertest'

import { app, PATHS } from '../../app'
import { connectDB, logger, SERVER_CONFIG } from '../../shared'

// Fuer BDD (= Behavior-Driven Development)
import('chai-string').then(chaiString => chai.use(chaiString))

// TESTSERVER

const { host } = SERVER_CONFIG

connectDB()
const server = app.listen(0, host, () => {
    logger.info(`Node ${process.version}`)
    logger.info(
        `Testserver ist gestartet: http://${host}:${
            (server.address() as AddressInfo).port
        }`,
    )
    server.emit('testServerStarted')
})

before((done: MochaDone) => {
    server.on('testServerStarted', () => done())
})

// TESTDATEN

const idGetVorhanden = '0ca33d98-483f-4168-b9c0-86b11ebd3cc6'
const idNichtVorhanden = '00000000-0000-0000-0000-000000000999'

const neuerArtikel: object = {
    ean: 111111,
    description: 'Put Test',
    price: 1,
    availability: true,
    manufacturer: 'TestGmBh',
}
const neuerArtikelInvalid: object = {
    ean: 'Fehler',
    description: 'Put Test',
    price: 2,
    availability: true,
    manufacturer: 'TestGmBh',
}

const idDeleteVorhanden = '1919bbaf-b598-4f7b-b975-0b801be4c1a2'

const loginDaten: object = {
    username: 'admin',
    password: 'p',
}
// TESTS

let token: string

const path = PATHS.articles
const loginPath = PATHS.login

// get

describe('GET /articles', () =>
    it('Alle Arikel', (done: MochaDone) => {
        request(server)
            .get(path)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.not.empty

                done()
            })
    }))

describe('GET /articles/:id', () => {
    it('Artikel mit vorhandener ID', (done: MochaDone) => {
        request(server)
            .get(`${path}/${idGetVorhanden}`)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                const selfLink = response.body._links.self.href
                selfLink.should.endWith(idGetVorhanden)
                done()
            })
    })

    it('Kein Artikel mit nicht-vorhandener ID', (done: MochaDone) => {
        request(server)
            .get(`${path}/${idNichtVorhanden}`)
            .expect(404)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })
})

// Post

describe('POST /articles', () => {
    before((done: MochaDone) => {
        request(server)
            .post(`${loginPath}`)
            .set('Content-type', `application/x-www-form-urlencoded`)
            .send(loginDaten)
            .expect(200)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                token = response.body.token
                token.should.be.not.empty
                done()
            })
    })

    it('Neuer Artikel', (done: MochaDone) => {
        request(server)
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(neuerArtikel)
            .expect(201)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }

                const { location } = response.header
                location.should.be.not.empty

                const indexLastSlash = location.lastIndexOf('/')
                const idStr = location.substring(indexLastSlash + 1)
                idStr.should.match(
                    /[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-[\dA-Fa-f]{12}/,
                )
                done()
            })
    })

    it('Neuer Artikel mit Daten', (done: MochaDone) => {
        request(server)
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(neuerArtikelInvalid)
            .expect(400)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }

                const { body } = response
                body.ean.should.endWith('Der Artikel muss eine EAN haben.')

                done()
            })
    })
})

// delete

describe('DELETE /articles', () => {
    before((done: MochaDone) => {
        request(server)
            .post(`${loginPath}`)
            .set('Content-type', `application/x-www-form-urlencoded`)
            .send(loginDaten)
            .expect(200)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                token = response.body.token
                token.should.be.not.empty
                done()
            })
    })

    it('Vorhandenen Artikel loeschen', (done: MochaDone) => {
        request(server)
            .delete(`${path}/${idDeleteVorhanden}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })
})
