export const generateParams = (parent: number, sort?: string, search?: string): string => {
  let URL = '';
  if (search && search !== '') {
    return (URL = `?search=${search}`);
  }
  if (parent) {
    URL = `?parent=${parent}`;
  }
  if (sort) {
    URL = `?sort=${sort}`;
  }
  if (parent && sort) {
    URL = `?parent=${parent}&sort=${sort}`;
  }
  return URL;
};
