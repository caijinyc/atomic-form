export const flatArray = (array: any): any => {
  return !Array.isArray(array) ? array : [].concat.apply([], array.map(flatArray));
};
