import { z } from "zod";

export const CreateImageSchema = z.object({
  // template: __fieldName__: z.__zodType__(),
  imageUrl: z.string()
});
export const UpdateImageSchema = z.object({
  id: z.number(),
  // template: __fieldName__: z.__zodType__(),
});

export const DeleteImageSchema = z.object({
  id: z.number(),
});
