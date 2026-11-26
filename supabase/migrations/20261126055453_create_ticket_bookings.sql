/*
# Create ticket_bookings table

1. New Tables
- `ticket_bookings` — stores free demo registrations for AFC events.
  - `id` (uuid, primary key, auto-generated)
  - `registration_type` (text, not null) — e.g. 'demo'
  - `booking_reference` (text, not null) — public booking reference, e.g. AFC-FN3-...
  - `ticket_number` (text, not null) — generated ticket number, e.g. DEMO-03-...
  - `event_slug` (text, not null) — event identifier, e.g. 'fight-night-3'
  - `event_name` (text, not null) — full event name
  - `event_date` (text, not null) — display date of the event
  - `venue` (text, not null) — venue name
  - `location` (text, not null) — venue location/suburb
  - `email` (text, not null) — booking contact email
  - `quantity` (integer, not null) — number of attendees (1–20)
  - `ticket_type` (text, not null) — e.g. 'general-admission'
  - `ticket_price` (integer, not null) — per-ticket price (0 for free)
  - `accommodation` (boolean, not null) — optional accommodation add-on
  - `accommodation_hotel` (text, nullable) — hotel name if selected
  - `accommodation_price` (integer, not null) — accommodation add-on price
  - `total_amount` (integer, not null) — booking total (0 for free events)
  - `attendee_names` (jsonb, not null) — array of attendee full names
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `ticket_bookings`.
- This app has no sign-in; bookings are public demo registrations, so grant
  INSERT to `anon` and `authenticated` with a WITH CHECK that validates the
  booking payload (valid email, quantity 1–20, free event fields).
- No SELECT/UPDATE/DELETE for anon: bookings are write-only from the browser.

3. Notes
- Table replaces the AppDeploy backend storage for ticket bookings.
- Validation previously done in the AppDeploy server (email format, quantity
  bounds, attendee name lengths, free-event fields) is enforced here as a
  WITH CHECK constraint on insert.
*/

CREATE TABLE IF NOT EXISTS ticket_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_type text NOT NULL,
  booking_reference text NOT NULL,
  ticket_number text NOT NULL,
  event_slug text NOT NULL,
  event_name text NOT NULL,
  event_date text NOT NULL,
  venue text NOT NULL,
  location text NOT NULL,
  email text NOT NULL,
  quantity integer NOT NULL,
  ticket_type text NOT NULL,
  ticket_price integer NOT NULL,
  accommodation boolean NOT NULL,
  accommodation_hotel text,
  accommodation_price integer NOT NULL,
  total_amount integer NOT NULL,
  attendee_names jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ticket_bookings ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON TABLE ticket_bookings TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_ticket_bookings" ON ticket_bookings;
CREATE POLICY "anon_insert_ticket_bookings"
ON ticket_bookings FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_slug = 'fight-night-3'
  AND registration_type = 'demo'
  AND ticket_type = 'general-admission'
  AND ticket_price = 0
  AND accommodation = false
  AND accommodation_price = 0
  AND total_amount = 0
  AND quantity >= 1 AND quantity <= 20
  AND email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  AND length(email) <= 254
  AND jsonb_typeof(attendee_names) = 'array'
  AND jsonb_array_length(attendee_names) = quantity
);
