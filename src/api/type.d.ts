import { AxiosResponse } from 'axios';

declare interface IResponse<T = any> {
  code: string;
  data: T extends any ? T : T & any;
}

declare type ResPage<T> = {
  records: T[];
  total: number;
  size?: number;
  pages?: number;
};

declare type PageParams = {
  size: number;
  current: number;
};
