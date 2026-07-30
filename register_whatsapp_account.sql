-- Run this SQL in your PostgreSQL to register your Meta WhatsApp account
-- Replace YOUR_PHONE_NUMBER_ID and YOUR_ACCESS_TOKEN with values from Meta Dashboard

INSERT INTO "WhatsAppAccount" (
  id,
  "businessId",
  "phoneNumber",
  "phoneNumberId",
  "displayName",
  "accessToken",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  b.id,
  '+94771234567',          -- Your WhatsApp Business phone number
  'YOUR_PHONE_NUMBER_ID',  -- From Meta Dashboard → WhatsApp → API Setup
  'Demo Fashion Store',
  'YOUR_ACCESS_TOKEN',     -- From Meta Dashboard → WhatsApp → API Setup
  true,
  NOW(),
  NOW()
FROM "Business" b
WHERE b.slug = 'demo-fashion'
ON CONFLICT DO NOTHING;
