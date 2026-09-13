// Validación del documento OpenAPI consolidado (Step 7 del plan de Code
// Generation): parseo válido, sin referencias $ref rotas, cobertura de las 6
// rutas de contrato, y que cada regla de negocio de forma (BR2.2, BR3.1, BR9.1)
// esté reflejada como restricción en el schema correspondiente — no basta con
// que el endpoint exista.
import { parse as parseYaml } from "yaml";
const REQUIRED_TAGS = [
    "Auth",
    "VendorDirectory",
    "CommissionTier",
    "SalesEntry",
    "CommissionLedger",
    "Notification",
];
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Recolecta cada string "$ref" presente en cualquier profundidad del documento. */
function collectRefs(node, refs) {
    if (Array.isArray(node)) {
        for (const item of node)
            collectRefs(item, refs);
        return;
    }
    if (!isRecord(node))
        return;
    for (const [key, value] of Object.entries(node)) {
        if (key === "$ref" && typeof value === "string")
            refs.push(value);
        else
            collectRefs(value, refs);
    }
}
function resolveLocalRef(doc, ref) {
    if (!ref.startsWith("#/"))
        return undefined;
    const segments = ref.slice(2).split("/");
    let cursor = doc;
    for (const segment of segments) {
        if (!isRecord(cursor))
            return undefined;
        cursor = cursor[segment];
    }
    return cursor;
}
function collectTags(doc) {
    const tags = new Set();
    const paths = doc.paths;
    if (!isRecord(paths))
        return tags;
    for (const pathItem of Object.values(paths)) {
        if (!isRecord(pathItem))
            continue;
        for (const operation of Object.values(pathItem)) {
            if (!isRecord(operation))
                continue;
            const opTags = operation.tags;
            if (Array.isArray(opTags)) {
                for (const tag of opTags)
                    if (typeof tag === "string")
                        tags.add(tag);
            }
        }
    }
    return tags;
}
function schemaProp(doc, schemaName, propName) {
    const schemas = isRecord(doc.components) ? doc.components.schemas : undefined;
    const schema = isRecord(schemas) ? schemas[schemaName] : undefined;
    if (!isRecord(schema))
        return undefined;
    const props = schema.properties;
    if (!isRecord(props))
        return undefined;
    const prop = props[propName];
    return isRecord(prop) ? prop : undefined;
}
function schemaRequires(doc, schemaName, propName) {
    const schemas = isRecord(doc.components) ? doc.components.schemas : undefined;
    const schema = isRecord(schemas) ? schemas[schemaName] : undefined;
    if (!isRecord(schema))
        return false;
    const required = schema.required;
    return Array.isArray(required) && required.includes(propName);
}
/**
 * Verifica que cada regla de negocio de forma de `functional-design/rules.md`
 * que tiene equivalente de contrato esté reflejada en el schema — no solo que
 * el endpoint exista.
 */
function checkBusinessRuleShapes(doc, issues) {
    // BR2.1 — Vendor.budget positivo (minimum 0.01) en VendorInput.
    const budget = schemaProp(doc, "VendorInput", "budget");
    if (!budget || budget.minimum !== 0.01) {
        issues.push({
            code: "BR2.1",
            message: "VendorInput.budget debe declarar minimum: 0.01 (presupuesto positivo).",
        });
    }
    // BR2.2 — CommissionTierInput requiere channel, tierType, order, thresholdValue, commissionRate.
    const tierRequired = ["channel", "tierType", "order", "thresholdValue", "commissionRate"];
    for (const field of tierRequired) {
        if (!schemaRequires(doc, "CommissionTierInput", field)) {
            issues.push({
                code: "BR2.2",
                message: `CommissionTierInput debe requerir el campo "${field}".`,
            });
        }
    }
    // BR3.1 — DailySaleInput.amount y .returns no negativos (minimum 0).
    for (const field of ["amount", "returns"]) {
        const prop = schemaProp(doc, "DailySaleInput", field);
        if (!prop || prop.minimum !== 0) {
            issues.push({
                code: "BR3.1",
                message: `DailySaleInput.${field} debe declarar minimum: 0.`,
            });
        }
    }
    // BR9.1 — ManualNotificationInput requiere message y recipients, message no vacío.
    for (const field of ["message", "recipients"]) {
        if (!schemaRequires(doc, "ManualNotificationInput", field)) {
            issues.push({
                code: "BR9.1",
                message: `ManualNotificationInput debe requerir el campo "${field}".`,
            });
        }
    }
    const message = schemaProp(doc, "ManualNotificationInput", "message");
    if (!message || message.minLength !== 1) {
        issues.push({
            code: "BR9.1",
            message: "ManualNotificationInput.message debe declarar minLength: 1 (no vacío).",
        });
    }
}
export function validateContract(yamlText) {
    const issues = [];
    let document;
    try {
        document = parseYaml(yamlText);
    }
    catch (e) {
        return {
            valid: false,
            issues: [{ code: "PARSE_ERROR", message: e instanceof Error ? e.message : String(e) }],
            document: null,
        };
    }
    if (!isRecord(document)) {
        return {
            valid: false,
            issues: [{ code: "PARSE_ERROR", message: "El documento OpenAPI no es un objeto YAML válido." }],
            document,
        };
    }
    if (document.openapi !== "3.0.3") {
        issues.push({ code: "VERSION", message: 'El documento debe declarar openapi: "3.0.3".' });
    }
    // Sin referencias $ref rotas.
    const refs = [];
    collectRefs(document, refs);
    for (const ref of refs) {
        if (resolveLocalRef(document, ref) === undefined) {
            issues.push({ code: "BROKEN_REF", message: `Referencia rota: "${ref}" no resuelve a ningún nodo del documento.` });
        }
    }
    // Cobertura de las 6 rutas de contrato (por tag, cada una con al menos un método).
    const tags = collectTags(document);
    for (const requiredTag of REQUIRED_TAGS) {
        if (!tags.has(requiredTag)) {
            issues.push({ code: "MISSING_CONTRACT", message: `Ningún endpoint declara el tag "${requiredTag}".` });
        }
    }
    checkBusinessRuleShapes(document, issues);
    return { valid: issues.length === 0, issues, document };
}
