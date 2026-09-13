// Step 8 del plan de Code Generation: genera el paquete de tipos TypeScript
// consumido por backend-api y mobile-app a partir de openapi.yaml — decisión
// de NFR Requirements (workspace de monorepo, sin registro npm externo).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const here = dirname(fileURLToPath(import.meta.url));
const OPENAPI_PATH = resolve(here, "..", "openapi", "openapi.yaml");
const OUTPUT_PATH = resolve(here, "..", "src", "types.ts");

export async function generateTypes(
  openapiPath: string = OPENAPI_PATH,
  outputPath: string = OUTPUT_PATH,
): Promise<string> {
  const yamlText = await readFile(openapiPath, "utf-8");
  const ast = await openapiTS(yamlText);
  const output = [
    "// Archivo generado — NO editar a mano.",
    "// Regenerar con: npm run generate-types --workspace=packages/api-contract",
    "// Fuente: openapi/openapi.yaml",
    "",
    astToString(ast),
  ].join("\n");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output, "utf-8");
  return output;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateTypes()
    .then(() => {
      console.log(`Tipos generados en ${OUTPUT_PATH}`);
    })
    .catch((error) => {
      console.error("Falló la generación de tipos:", error);
      process.exitCode = 1;
    });
}
