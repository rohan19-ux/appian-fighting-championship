import { router, json, error, db } from '@appdeploy/sdk';

const TICKET_EVENT = {
  slug: 'fight-night-3',
  name: 'AFC Fight Night 3: Mather vs Carroll',
  date: 'Saturday 28 November 2026',
  venue: 'Yerroulbin Reserve',
  location: 'Birchgrove',
} as const;

export const handler = router({
  'POST /api/ticket-bookings': [
    async ({ body }) => {
      const input = (body ?? {}) as {
        eventSlug?: unknown;
        email?: unknown;
        quantity?: unknown;
        ticketType?: unknown;
        accommodation?: unknown;
        attendeeNames?: unknown;
      };

      if (input.eventSlug !== TICKET_EVENT.slug) {
        return error('Fight Night 2 is completed and ticket registration is closed. Choose an available AFC event.', 400);
      }

      const email = typeof input.email === 'string' ? input.email.trim() : '';
      if (email.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
        return error('Enter a valid booking email address.', 400);
      }

      const quantity = Number(input.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return error('Choose between 1 and 20 attendees.', 400);
      }
      if (!Array.isArray(input.attendeeNames) || input.attendeeNames.length !== quantity) {
        return error('Enter a name for every attendee.', 400);
      }

      const attendeeNames = input.attendeeNames.map(name => typeof name === 'string' ? name.trim() : '');
      if (attendeeNames.some(name => name.length < 2 || name.length > 100)) {
        return error('Each attendee name must be between 2 and 100 characters.', 400);
      }
      if (input.ticketType !== 'general-admission' || input.accommodation !== false) {
        return error('Fight Night 3 offers General Admission only, with no accommodation add-ons.', 400);
      }

      const suffix = `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const bookingReference = `AFC-FN3-${suffix}`;
      const ticketNumber = `DEMO-03-${suffix}`;

      try {
        const [savedId] = await db.add('ticket_bookings', [{
          registrationType: 'demo',
          bookingReference,
          ticketNumber,
          eventSlug: TICKET_EVENT.slug,
          eventName: TICKET_EVENT.name,
          eventDate: TICKET_EVENT.date,
          venue: TICKET_EVENT.venue,
          location: TICKET_EVENT.location,
          email,
          quantity,
          ticketType: 'general-admission',
          ticketPrice: 0,
          accommodation: false,
          accommodationHotel: null,
          accommodationPrice: 0,
          totalAmount: 0,
          attendeeNames,
          createdAt: new Date().toISOString(),
        }]);
        if (!savedId) return error('The demo registration could not be saved. Please try again.', 503);
        return json({
          saved: true,
          registrationType: 'demo',
          bookingReference,
          ticketNumber,
          totalAmount: 0,
        });
      } catch {
        return error('The demo registration could not be saved. Please try again.', 503);
      }
    },
  ],
});
