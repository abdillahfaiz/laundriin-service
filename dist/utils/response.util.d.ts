export interface SuccessResponse {
    success: true;
    message: string;
    data: any;
}
export interface ErrorResponse {
    success: false;
    message: string;
    errors: any[] | null;
}
export declare const success: (message: string, data?: any) => SuccessResponse;
export declare const error: (message: string, errors?: any[] | null) => ErrorResponse;
//# sourceMappingURL=response.util.d.ts.map