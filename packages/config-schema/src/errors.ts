export type PackErrorCode =
  | "SCHEMA_INVALID"
  | "MANIFEST_KIND_MISMATCH"
  | "PACK_ID_INVALID"
  | "PACK_REFERENCE_NOT_FOUND"
  | "PATH_NOT_FOUND"
  | "ENUM_OUT_OF_RANGE"
  | "DUPLICATE_ID"
  | "RELATION_REFERENCE_INVALID"
  | "SOURCE_OVERRIDE_TARGET_INVALID"
  | "FORBIDDEN_FIELD_PRESENT";

export interface PackValidationIssue {
  code: PackErrorCode;
  message: string;
  path: string[];
}

export class PackValidationError extends Error {
  readonly issues: PackValidationIssue[];

  constructor(message: string, issues: PackValidationIssue[]) {
    super(message);
    this.name = "PackValidationError";
    this.issues = issues;
  }
}
