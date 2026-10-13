import { z } from 'zod';

// conditions.json is not a JSON:API document, so these schemas describe the file's own shape.
// Every bound is optional: an absent key means no limit in that direction. Relative humidity is
// in percent here, as in the file; the physics works in fractions and converts at the boundary.
export const EnvelopeSchema = z.object({
  label: z.string().optional(),
  dryBulbMinC: z.number().optional(),
  dryBulbMaxC: z.number().optional(),
  dewPointMinC: z.number().optional(),
  dewPointMaxC: z.number().optional(),
  rhMinPct: z.number().optional(),
  rhMaxPct: z.number().optional(),
  wetBulbMinC: z.number().optional(),
  wetBulbMaxC: z.number().optional()
});

export const ReadingSchema = z.object({
  timestamp: z.iso.datetime(),
  dryBulbC: z.number(),
  rhPct: z.number().min(0).max(100)
});

const SiteRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  envelope: EnvelopeSchema,
  allowableEnvelope: EnvelopeSchema.optional(),
  readings: z.array(ReadingSchema)
});

// A Site as the UI sees it: the readings arrive one per poll through the feed, never in bulk.
export const SiteSchema = SiteRecordSchema.omit({ readings: true });

export const ConditionsFileSchema = z.object({ sites: z.array(SiteRecordSchema).min(1) });

export type Envelope = z.infer<typeof EnvelopeSchema>;
/** The allowable envelope has the same bounds as the envelope, just wider. */
export type AllowableEnvelope = Envelope;
export type Reading = z.infer<typeof ReadingSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type SiteRecord = z.infer<typeof SiteRecordSchema>;
export type ConditionsFile = z.infer<typeof ConditionsFileSchema>;
