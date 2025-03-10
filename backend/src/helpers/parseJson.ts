import _ from 'lodash';

export default function parseJSON(data, onError?) {
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
