import qs from 'qs';

export const generateParams = params => {
  const queryString = qs.stringify(params, { skipNulls: true, addQueryPrefix: true });
  return queryString;
};
