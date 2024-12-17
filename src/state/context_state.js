let context = {
    domain: "General",
    project_goal: "Assist the user",
    known_details: [],
    previous_progress: ""
  };
  
  export function getContextState() {
    return context;
  }
  
  export function updateContext(newContext) {
    context = { ...context, ...newContext };
  }
  