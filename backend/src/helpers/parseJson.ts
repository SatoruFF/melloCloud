import _ from 'lodash';

export function parseJson(data, onError?) {
  if (_.isString(data)) {
    try {
      return JSON.parse(data);
    } catch (e) {
      if (onError) {
        onError(e, data);
        return;
      }
      return data;
    }
  } else {
    return data;
  }
}

export const stringify = (t) => {
  return JSON.stringify(t)
}