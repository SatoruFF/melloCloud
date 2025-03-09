export const getQueryParams = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams(window.location.search);
  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined) {
      searchParams.set(name, value);
    }
  });
  return `?${searchParams.toString()}`;
};

// TODO: add to all request or interceptors
/**
 * Adds query parameters to the current URL, allowing users to copy and share filtered pages.
 * @param {Object} params - An object containing query parameters to add to the URL.
 * @param {string} [params.search] - The search query to add to the URL.
 * @param {string} [params.sort] - The sort parameter to add to the URL (e.g., "date").
 * @returns {void} - This function does not return anything; it modifies the current URL.
 * @example
 * Adds search and sort parameters to the URL
 * addParamsToUrl({ search: "some search", sort: "date" });
 */
export const addQueryParams = (params: Record<string, string>) => {
  window.history.pushState(null, '', getQueryParams(params));
};
