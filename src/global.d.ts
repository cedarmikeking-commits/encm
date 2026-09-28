declare global {
  declare interface Fn<T = any> {
    (...arg: T[]): T;
  }
  declare interface IResponse<T = any> {
    code: string;
    data: T extends any ? T : T & any;
  }
  export type ResPage<T> = {
    records: T[];
    total: number;
    size?: number;
    pages?: number;
  };
  export type PageParams = {
    size: number;
    current: number;
  };
}
