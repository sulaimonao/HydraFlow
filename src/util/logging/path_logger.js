// src/util/logging/path_logger.js
import { resolve } from "path";

export const logResolvedPath = (modulePath) => {
  const resolvedPath = resolve(modulePath);
  console.log(`Resolved path for ${modulePath}: ${resolvedPath}`);
  return resolvedPath;
};
