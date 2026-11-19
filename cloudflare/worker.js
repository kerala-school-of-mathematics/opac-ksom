/**
 * Cloudflare Worker - Reverse Proxy for KSoM Library OPAC
 * 
 * Routes requests from https://opac.ksom.res.in to the Koha backend at http://210.212.228.235:80
 * while hiding the IP address from the user's browser address bar.
 */

export default {
  async fetch(request, env, ctx) {
    const originHost = '210.212.228.235';
    const originPort = 80;
    const vhost = 'opac.ksom.res.in';

    const clientUrl = new URL(request.url);

    // Build the target URL pointing to Koha server
    const targetUrl = new URL(request.url);
    targetUrl.protocol = 'http:';
    targetUrl.hostname = originHost;
    targetUrl.port = originPort.toString();

    // Clone request headers and set Koha VirtualHost
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', vhost);
    newHeaders.set('X-Forwarded-Host', clientUrl.hostname);
    newHeaders.set('X-Forwarded-Proto', clientUrl.protocol.replace(':', ''));

    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'manual'
    });

    try {
      const response = await fetch(proxyRequest);

      // Clone response headers
      const responseHeaders = new Headers(response.headers);

      // Rewrite any redirect Location headers so the user stays on the domain
      const location = responseHeaders.get('Location');
      if (location) {
        const rewrittenLocation = location
          .replace(/http:\/\/210\.212\.228\.235(:\d+)?/gi, `https://${clientUrl.hostname}`)
          .replace(/http:\/\/opac\.ksom\.res\.in/gi, `https://${clientUrl.hostname}`);
        responseHeaders.set('Location', rewrittenLocation);
      }

      // Remove restrictive domain on cookies so session remains valid on the subdomain
      const setCookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
      if (setCookies.length > 0) {
        responseHeaders.delete('set-cookie');
        for (const cookie of setCookies) {
          responseHeaders.append('set-cookie', cookie.replace(/Domain=[^;]+;?/i, ''));
        }
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    } catch (err) {
      return new Response(`502 Bad Gateway: Could not reach Koha backend server. ${err.message}`, {
        status: 502,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};

