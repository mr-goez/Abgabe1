// Nutzung des Decorator-Patterns ermöglichen (copied)

import { inspect } from 'util'

import { logger } from './logger'

// In Anlehnung an:
// https://medium.com/front-end-hacking/javascript-make-your-code-cleaner-with-decorators-d34fc72af947
// http://html5hive.org/getting-started-with-angular-2#crayon-560cd5f774dd7156114609
// https://github.com/k1r0s/kaop-ts

/**
 * Decorator zur Protokollierung einer Methode (NICHT: Funktion):
 * <ul>
 *  <li> Methodenaufruf:&nbsp;&nbsp;&nbsp; &gt;
 *       <i>Klassenname</i>.<i>Methodenname</i>; zzgl. aktuelle Argumente
 *  <li> Methodenende:&nbsp;&nbsp;&nbsp; &lt;
 *       <i>Klassenname</i>.<i>Methodenname</i> zzgl. R&uuml;ckgabewert
 * </ul>
 */
export function log(
    target: any,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
): TypedPropertyDescriptor<any> {
    const originalMethod = descriptor.value

    // keine Arrow Function wg. this im Funktionsrumpf
    // Spread-Parameter
    // tslint:disable-next-line:only-arrow-functions
    descriptor.value = function(...args: Array<any>) {
        const klasseAsString = target.toString()
        // indexOf: Zaehlung ab 0. -1 bedeutet nicht enthalten
        // bei Klassen mit toString() werden ggf. Attributwerte nach einem ":""
        // ausgegeben
        const positionColon = klasseAsString.indexOf(':')
        const klassenname =
            positionColon === -1
                ? klasseAsString
                : klasseAsString.substring(0, positionColon)

        const levelVerbose =
            klassenname === 'AuthRequestHandler' ||
            klassenname === 'AuthService' ||
            klassenname === 'UsersService' ||
            klassenname === 'RolesService' ||
            klassenname === 'SharedRequestHandler'

        if (args.length === 0) {
            if (levelVerbose) {
                logger.verbose(`> ${klassenname}.${key as string}()`)
            } else {
                logger.debug(`> ${klassenname}.${key as string}()`)
            }
        } else {
            // Gibt es Request- oder Response-Objekte von Express?
            if (containsRequestResponse(args)) {
                if (levelVerbose) {
                    logger.verbose(
                        `> ${klassenname}.${key as string}(): args = <RequestResponse>`,
                    )
                } else {
                    logger.debug(
                        `> ${klassenname}.${key as string}(): args = <RequestResponse>`,
                    )
                }
            } else {
                try {
                    if (levelVerbose) {
                        logger.verbose(
                            `> ${klassenname}.${key as string}(): args = ${JSON.stringify(
                                args,
                            )}`,
                        )
                    } else {
                        logger.debug(
                            `> ${klassenname}.${key as string}(): args = ${JSON.stringify(
                                args,
                            )}`,
                        )
                    }
                } catch {
                    // TypeError bei stringify wegen einer zykl. Datenstruktur
                    // const obj = {a: "foo", b: obj}
                    // https://nodejs.org/api/util.html
                    // https://github.com/WebReflection/circular-json
                    logger.debug(
                        `> ${klassenname}.${key as string}(): args = ${inspect(
                            args,
                        )}`,
                    )
                }
            }
        }

        const result = originalMethod.apply(this, args)
        let resultStr: string
        if (result === undefined) {
            resultStr = 'void || undefined'
        } else if (isPromise(result)) {
            resultStr = '<Promise>'
        } else {
            resultStr = JSON.stringify(result)
        }

        if (levelVerbose) {
            logger.verbose(
                `< ${klassenname}.${key as string}(): result = ${resultStr}`,
            )
        } else {
            logger.debug(
                `< ${klassenname}.${key as string}(): result = ${resultStr}`,
            )
        }

        return result
    }

    return descriptor
}

const containsRequestResponse = (args: Array<any>) =>
    args
        .filter(arg => arg !== undefined)
        .find(arg => isRequest(arg) || isResponse(arg)) !== undefined

const isRequest = (arg: any) =>
    arg.method !== undefined && arg.httpVersion !== undefined

const isResponse = (arg: any) => arg.statusCode !== undefined

const isPromise = (result: any) =>
    result !== undefined &&
    result.model !== undefined &&
    result.schema !== undefined
