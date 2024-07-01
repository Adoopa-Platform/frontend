const generateUrlParams = function (params: object) {
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((param) => urlParams.append(key, param));
    } else if (value) {
      urlParams.append(key, value);
    }
  }
  return urlParams;
};
export default { generateUrlParams };
