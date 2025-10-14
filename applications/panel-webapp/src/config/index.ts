import z from "zod";

export const configSchema = z.object({
  VITE_BASE_URL: z.string(),
});

const config = configSchema.parse(import.meta.env);

export const BASE_URL = `${config.VITE_BASE_URL}`;

export default config;
