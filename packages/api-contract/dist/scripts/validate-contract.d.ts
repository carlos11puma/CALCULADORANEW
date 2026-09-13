export interface ValidationIssue {
    code: string;
    message: string;
}
export interface ValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
    document: unknown;
}
export declare function validateContract(yamlText: string): ValidationResult;
