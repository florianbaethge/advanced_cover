// Loaded with `node --import` before the tests (see the `test` script).
import { register } from "node:module";

register("./ts-resolve.mjs", import.meta.url);
