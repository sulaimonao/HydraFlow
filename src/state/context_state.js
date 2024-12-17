let currentContext = {};

export function updateContext(newData) {
  currentContext = { ...currentContext, ...newData };
  return currentContext;
}

export { currentContext };
