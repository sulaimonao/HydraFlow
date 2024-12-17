// helpers.js
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  export function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }
  
  export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  