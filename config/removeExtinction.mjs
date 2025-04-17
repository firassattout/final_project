export function removeExtension(filename) {
  const parts = filename.split(".");
  parts.pop();
  return parts.join(".");
}
