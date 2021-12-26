export interface FileUploadParams {
  filename: string;
  filedata: string;
  doctype: string;
  docname: string;
  folder?: string;
  decode_base64?: boolean;
  is_private?: boolean;
  docfield?: string;
}
