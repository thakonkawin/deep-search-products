import { BASE_URL } from ".";
import type { CreateClientConfig } from "../services/openapi/client.gen";

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseURL: BASE_URL,
});
