/** COPIED FROM resources LIB :/ */
const ValidationError = {
  ForeignKey: 201,
  RequiredField: 104,
  MinLength: 123,
  MaxLength: 124,
  Unique: 200
} as const;
type ValidationError = (typeof ValidationError)[keyof typeof ValidationError];

type ErrorType = {
  code?: ValidationError;
  detail: string;
  meta?: {
    validation?: object;
    correlationId?: string;
  };
  source?: {
    pointer: string;
    body: string;
    query: string;
  };
  status: number;
};

type ErrorResponse = {
  data: {
    errors: ErrorType[];
  };
};

export { type ErrorResponse, type ErrorType, ValidationError };
