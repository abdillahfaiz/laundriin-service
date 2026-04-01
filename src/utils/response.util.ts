export interface SuccessResponse {
  success: true;
  message: string;
  data: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: any[] | null;
}

export const success = (message: string, data: any = null, pagination?: SuccessResponse["pagination"]): SuccessResponse => {
  const res: SuccessResponse = { success: true, message, data };
  if (pagination) res.pagination = pagination;
  return res;
};

export const error = (message: string, errors: any[] | null = null): ErrorResponse => ({
  success: false,
  message,
  errors,
});
