import axios, {AxiosInstance} from 'axios';
import {runtimeName} from './runtime';
import {ListParameters} from './types/ListParameters';
import {FrappeQuerParams} from './types/FrappeQueryParams';
import {FileUploadParams} from './types/FileUploadParams';

export class FrappeSDK {
  url: globalThis.URL;
  username?: string;
  password?: string;
  req: AxiosInstance;

  constructor(url: string, username?: string, password?: string) {
    this.url = new URL(url);
    this.req = axios.create({baseURL: url});
    this.username = username;
    this.password = password;
  }

  async login(username: string, password: string) {
    const resp = await this.req.post(this.url.origin, {
      cmd: 'login',
      usr: username,
      pwd: password,
    });

    if (runtimeName === 'node') {
      const cookie_headers = resp.headers['set-cookie'];
      if (cookie_headers) {
        const sid = cookie_headers[0];
        this.req.defaults.headers.common.Cookie = sid;
      }
    }

    if (runtimeName === 'browser') {
      this.req.defaults.withCredentials = true;
    }
  }

  async get_doc(doc: string, name?: string) {
    if (!name) {
      name = doc;
    }
    return this.get_request(`/api/resource/${doc}/${name}`);
  }

  async rename_doc(doc: string, prev_name: string, new_name: string) {
    return this.post_api('frappe.model.rename_doc.update_document_title', {
      doctype: doc,
      docname: prev_name,
      new_name: new_name,
      merge: 0,
    });
  }

  async get_api(method: string) {
    return this.get_request(`/api/method/${method}`);
  }

  async post_api(method: string, payload: any) {
    const val = await this.post_request(`/api/method/${method}`, payload);

    console.log(val.headers);

    return val;
  }

  async logout() {
    return this.get_api('logout');
  }

  async get_list({
    doc,
    fields = ['name'],
    filters = [[]],
    limit_page_length = 20,
    limit_start = 0,
  }: ListParameters) {
    const url = this._make_frappe_url(`/api/resource/${doc}`, {
      fields,
      filters,
      limit_page_length,
      limit_start,
    });
    return this.get_request(url);
  }

  async get_count(doctype: string, filters?: any, parent?: string) {
    return this.post_api('frappe.client.get_count', {
      doctype,
      filters,
      parent,
    });
  }

  async get_single_value(doctype: string, field: string) {
    return this.post_api('frappe.get_single_value', {
      doctype,
      field,
    });
  }

  async set_value(
    doctype: string,
    name: string,
    fieldname: string,
    value?: string
  ) {
    this.post_api('frappe.client.set_value', {
      doctype,
      name,
      fieldname,
      value,
    });
  }

  async insert(doc: any) {
    return this.post_api('frappe.client.insert', doc);
  }

  async save(doc: any) {
    return this.post_api('frappe.client.save', doc);
  }

  async sumbit(doc: any) {
    return this.post_api('frappe.client.submit', doc);
  }

  async cancel(doctype: string, name: string) {
    return this.post_api('frappe.client.cancel', {
      doctype,
      name,
    });
  }

  async delete_doc(doctype: string, name: string) {
    return this.post_api('frappe.client.delete', {
      doctype,
      name,
    });
  }

  async attach_file({
    filename,
    filedata,
    doctype,
    docname,
    docfield,
    decode_base64 = true,
    is_private = true,
    folder = 'Home/Attachments',
  }: FileUploadParams) {
    return this.post_api('frappe.client.attach_file', {
      filename,
      filedata,
      doctype,
      docname,
      docfield,
      decode_base64,
      is_private,
      folder,
    });
  }

  async get_request(path: string) {
    return (await this.req.get(path)).data;
  }

  async post_request(path: string, payload: any) {
    return (await this.req.post(path, payload)).data;
  }

  async get_time_zone() {
    return this.get_api('frappe.client.get_time_zone');
  }

  _make_frappe_url(path: string, params: FrappeQuerParams) {
    const url = new URL(path, this.url.origin);
    if (params.fields) {
      url.search = url.search + `fields=${JSON.stringify(params.fields)}`;
    }

    if (params.filters) {
      url.search = url.search + `&filters=${JSON.stringify(params.filters)}`;
    }

    if (params.limit_start) {
      url.search = url.search + `&limit_start=${params.limit_start}`;
    }

    if (params.limit_page_length) {
      url.search =
        url.search + `&limit_page_length=${params.limit_page_length}`;
    }

    return url.href;
  }
}
