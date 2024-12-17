let currentContext = {};

function updateContext(newData) {
  currentContext = { ...currentContext, ...newData };
  return currentContext;
}

module.exports = { updateContext };
