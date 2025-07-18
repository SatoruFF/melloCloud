import qs from "qs";

export const generateParams = (params) => {
  // cause we can set parent like null in root dir
  const paramsWithNulls = Object.entries(params).reduce((acc, [key, value]) => {
    acc[key] = value === null ? "null" : value;
    return acc;
  }, {});

  const queryString = qs.stringify(paramsWithNulls, {
    skipNulls: true,
    addQueryPrefix: true,
  });

  return queryString;
};
