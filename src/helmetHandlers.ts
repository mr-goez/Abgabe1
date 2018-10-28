import * as helmet from 'helmet'

export const helmetHandlers = [
    // https://blog.appcanary.com/2017/http-security-headers.html
    // CSP = Content Security Policy
    //   https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
    //   https://tools.ietf.org/html/rfc7762
    helmet.contentSecurityPolicy({
        directives: {
            // tslint:disable:quotemark
            // prettier-ignore
            defaultSrc: ["https: 'self'"],
            // fuer Chrome mit dem Add-on JSONView
            // prettier-ignore
            styleSrc: ["https: 'unsafe-inline'"],
            // fuer GraphQL IDE => GraphiQL
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
            // prettier-ignore
            scriptSrc: ["https: 'unsafe-inline' 'unsafe-eval'"],
            // fuer GraphQL IDE => GraphiQL
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src
            imgSrc: ['data: https://localhost:8443/favicon.ico'],
            // tslint:enable:quotemark
        },
    }),
    // XSS = Cross-site scripting attacks: Header X-XSS-Protection
    //   https://www.owasp.org/index.php/Cross-site_scripting
    helmet.xssFilter(),
    // Clickjacking
    //   https://www.owasp.org/index.php/Clickjacking
    //   http://tools.ietf.org/html/rfc7034
    helmet.frameguard(),
    // HSTS = HTTP Strict Transport Security:
    //   Header Strict-Transport-Security
    //   https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
    //   https://tools.ietf.org/html/rfc6797
    helmet.hsts(),
    // MIME-sniffing: im Header X-Content-Type-Options
    //   https://blogs.msdn.microsoft.com/ie/2008/09/02/ie8-security-part-vi-beta-2-update
    //   http://msdn.microsoft.com/en-us/library/gg622941%28v=vs.85%29.aspx
    //   https://tools.ietf.org/html/rfc7034
    helmet.noSniff(),
    // Im Header "Cache-Control" and "Pragma" auf No Caching setzen
    helmet.noCache(),
]
