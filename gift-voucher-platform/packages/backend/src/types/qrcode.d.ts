declare module 'qrcode' {
  function toDataURL(text: string, options?: any): Promise<string>;
  function toBuffer(text: string, options?: any): Promise<Buffer>;
  function toString(text: string, options?: any): Promise<string>;
  
  export default {
    toDataURL,
    toBuffer,
    toString
  };
} 