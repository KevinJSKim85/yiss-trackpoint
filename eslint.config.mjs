import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // useEffect(() => setMounted(true), []) is the standard Next.js
      // hydration pattern and is used intentionally here; don't block CI on it.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
