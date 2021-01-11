
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}


export function isFunction(functionToCheck) {
 return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}