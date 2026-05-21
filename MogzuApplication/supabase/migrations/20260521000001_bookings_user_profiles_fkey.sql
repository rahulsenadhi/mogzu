-- Durable fix for PostgREST "Could not find a relationship between 'bookings' and 'user_profiles'" error.
--
-- bookings.user_id REFERENCES auth.users(id). PostgREST infers a transitive
-- relation via user_profiles.id ← auth.users.id, but this inference is brittle
-- (depends on schema cache state) and breaks the bookings → user_profiles
-- embed used by db.bookings.getById in BookingDetailPage, CancelBookingPage,
-- BookingPaymentPage, CorporateApprovalDetailPage, ReviewSubmitPage,
-- RescheduleBookingPage, VendorBookingRequestsPage detail.
--
-- Safe because user_profiles.id is itself FK -> auth.users.id ON DELETE CASCADE,
-- so every legitimate booking.user_id already has a matching user_profiles.id.

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_user_id_user_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Force PostgREST to reload its schema cache so the new relation is picked up
-- without requiring a manual project restart.
NOTIFY pgrst, 'reload schema';
