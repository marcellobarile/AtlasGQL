import _ from 'lodash';
import * as request from 'request-promise-native';

import { getEndpoint } from '../../../config/apis';

/**
 * Base class to be used for GraphQL connectors.
 * It does contain all the basic functions to perform
 * HTTP requests over different methods.
 * It is in charge of configuring the default HTTP headers
 * to be used for every request. Those headers are fully
 * expandible.
 */
class BaseConnector {
  protected cookie: string | undefined = '';
  protected endpoints = getEndpoint;
  protected defaultHeaders: Record<string, string>;

  constructor(cookie?: string) {
    this.cookie = cookie;

    this.defaultHeaders = {
      'accept': 'application/json, text/plain, */*',
      'accept-encoding': 'gzip, deflate, br',
      'content-type': 'application/json'
    };
    if (typeof this.cookie !== 'undefined' && this.cookie !== '') {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        cookie: this.cookie
      };
    }
  }

  // NOTE: It's useful to pass resolveWithFullResponse=false in case you need to
  // get access to the raw response, otherwise it will processed
  // through the JSON parse.
  /**
   * The method for GET requests
   * @param opts - The configuration object
   * @param resolveWithFullResponse - When true it does expose the full response content meaning "headers", "body" etc..
   */
  protected _get<T>(
    opts: request.Options,
    resolveWithFullResponse: boolean = false
  ): Promise<T> {
    if (resolveWithFullResponse) {
      opts.resolveWithFullResponse = true;
    }
    return request.get(opts);
  }

  /**
   * The method for POST requests
   * @param opts - The configuration object
   * @param resolveWithFullResponse - When true it does expose the full response content meaning "headers", "body" etc..
   */
  protected _post<T>(
    opts: request.Options,
    resolveWithFullResponse: boolean = false
  ): Promise<T> {
    if (resolveWithFullResponse) {
      opts.resolveWithFullResponse = true;
    }
    return request.post(opts);
  }

  /**
   * The method for PUT requests
   * @param opts - The configuration object
   * @param resolveWithFullResponse - When true it does expose the full response content meaning "headers", "body" etc..
   */
  protected _put<T>(
    opts: request.Options,
    resolveWithFullResponse: boolean = false
  ): Promise<T> {
    if (resolveWithFullResponse) {
      opts.resolveWithFullResponse = true;
    }
    return request.put(opts);
  }

  /**
   * The method for DELETE requests
   * @param opts - The configuration object
   * @param resolveWithFullResponse - When true it does expose the full response content meaning "headers", "body" etc..
   */
  protected _delete<T>(
    opts: request.Options,
    resolveWithFullResponse: boolean = false
  ): Promise<T> {
    if (resolveWithFullResponse) {
      opts.resolveWithFullResponse = true;
    }
    return request.delete(opts);
  }

  /**
   * The method for downloading binary contents
   * @param url - The URL of the requested resource
   */
  protected _download(url: string): Promise<{ filename: string; body: any }> {
    return new Promise((resolve, reject) => {
      this._get<request.FullResponse>(
        {
          url,
          headers: this.defaultHeaders,
          encoding: null
        },
        true
      )
        .then((res: request.FullResponse) => {
          const contentDisposition = res.headers['content-disposition'];
          if (typeof contentDisposition === 'undefined') {
            reject(new Error('Content-disposition header is missing'));
            return;
          }
          const filename = this.extractFilenameFromHeaderValue(
            contentDisposition
          );
          const body = Buffer.from(res.body, 'utf8');
          resolve({ filename, body });
        })
        .catch((err: Error) => {
          reject(err);
        });
    });
  }

  /**
   * Constructs the configuration object to be used in the requests
   * @param url - The URL to be called
   * @param body - The optional data to be passed
   * @param queryParams - The optional query parameters to be used in the request
   * @param headers  - The optional extra headers to be extended
   */
  protected constructRequestObject(
    url: string,
    body?: any,
    queryParams?: any,
    headers?: any
  ): request.Options {
    headers = _.assign({}, this.defaultHeaders, headers);

    const output: request.Options = {
      url,
      headers,
      json:
        headers['content-type'] === 'application/json' &&
        headers.responseType !== 'arraybuffer'
    };

    if (!_.isUndefined(body)) {
      output.body = body;
    }

    if (!_.isUndefined(queryParams)) {
      output.qs = queryParams;
    }

    return output;
  }

  /**
   * Extracts the filename from a given Content-Disposition header value.
   * @param str - The content of the header
   */
  private extractFilenameFromHeaderValue = (str: string) => {
    const regex = /filename\*\=(.*)''(.*)/g;
    const matches = regex.exec(str);
    return matches
      ? decodeURIComponent(matches[2]).replace(/\+/gi, ' ')
      : 'unknown';
  }
}

export { BaseConnector };
