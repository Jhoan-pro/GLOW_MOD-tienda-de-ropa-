import { HttpParams } from '@angular/common/http';

export interface ListParams {
  search?: string;
  skip?: number;
  take?: number;
}

export function toHttpParams(params?: ListParams): HttpParams {
  let result = new HttpParams();

  if (params?.search?.trim()) result = result.set('search', params.search.trim());
  if (params?.skip !== undefined) result = result.set('skip', params.skip);
  if (params?.take !== undefined) result = result.set('take', params.take);

  return result;
}
