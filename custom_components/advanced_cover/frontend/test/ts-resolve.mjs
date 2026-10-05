// Resolve hook for the unit tests: the panel sources import each other without
// a file extension (the bundler resolves that), Node needs it spelled out.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    const relative = specifier.startsWith("./") || specifier.startsWith("../");
    if (err?.code !== "ERR_MODULE_NOT_FOUND" || !relative) throw err;
    return nextResolve(`${specifier}.ts`, context);
  }
}
