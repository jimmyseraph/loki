const parseHeaders = (rawHeaders: string) => {
  const headers = new Headers();
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
  preProcessedHeaders.split(/\r?\n/).forEach((line) => {
    const parts: string[] = line.split(':');
    const key = parts.shift()?.trim();
    if (key) {
      const value = parts.join(':').trim();
      headers.append(key, value);
    }
  });
  return headers;
};

export default (url: string | URL, options: any) =>
  new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      interface Opt {
        [key: string]: any;
        status: number;
        statusText: string;
        headers: Headers;
      }
      let opts: Opt = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
      };
      opts.url =
        'responseURL' in xhr
          ? xhr.responseURL
          : opts.headers.get('X-Request-URL');
      const body = 'response' in xhr ? xhr.response : xhr.responseText;
      resolve(new Response(body, opts));
    };

    xhr.onerror = () => {
      reject(new TypeError('Network request failed'));
    };

    xhr.ontimeout = () => {
      reject(new TypeError('Network request failed'));
    };

    xhr.open(options.method, url, true);

    Object.keys(options.headers).forEach((key) => {
      xhr.setRequestHeader(key, options.headers[key]);
    });

    if (xhr.upload) {
      xhr.upload.onprogress = options.onProgress;
    }

    xhr.send(options.body);
  });
