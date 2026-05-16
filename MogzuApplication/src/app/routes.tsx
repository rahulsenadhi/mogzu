import { createBrowserRouter, Navigate, useParams } from "react-router";
import { getVendorListingProfileIds } from "@/app/lib/vendorModuleSelection";
import LandingPage from "@/app/components/LandingPage";
import LoginPage from "@/app/components/LoginPage";
import SignUpPage from "@/app/components/SignUpPage";
import CorporateSignUpForm from "@/app/components/CorporateSignUpForm";
import CorporateCompanyDetails from "@/app/components/CorporateCompanyDetails";
import CorporateInterests from "@/app/components/CorporateInterests";
import ChooseAccess from "@/app/components/ChooseAccess";
import VendorSignUpForm from "@/app/components/VendorSignUpForm";
import VendorOnboardingPage from "@/app/components/VendorOnboardingPage";
import VendorRegisterEntryPage from "@/app/components/VendorRegisterEntryPage";
import VendorVerificationPendingPage from "@/app/components/VendorVerificationPendingPage";
import VendorVerifyEmailPage from "@/app/components/VendorVerifyEmailPage";
import VendorRegistrationCompletePage from "@/app/components/VendorRegistrationCompletePage";
import WelcomeScreen from "@/app/components/WelcomeScreen";
import Dashboard from "@/app/components/Dashboard";
import AdminLayout from "@/app/components/AdminLayout";
import AdminDashboardPage from "@/app/components/AdminDashboardPage";
import AdminClientManagementPage from "@/app/components/AdminClientManagementPage";
import AdminIssuesPage from "@/app/components/AdminIssuesPage";
import AdminProductsPage from "@/app/components/AdminProductsPage";
import AdminProductCategoriesPage from "@/app/components/AdminProductCategoriesPage";
import AdminAddProductPage from "@/app/components/AdminAddProductPage";
import AdminTeamsPage from "@/app/components/AdminTeamsPage";
import AdminRolePermissionsPage from "@/app/components/AdminRolePermissionsPage";
import AdminNotificationsPage from "@/app/components/AdminNotificationsPage";
import AdminPaidPromotionsPage from "@/app/components/AdminPaidPromotionsPage";
import AdminVendorManagementDashboardPage from "@/app/components/AdminVendorManagementDashboardPage";
import AdminVendorOrderAnalyticsPage from "@/app/components/AdminVendorOrderAnalyticsPage";
import AdminTransactionsPage from "@/app/components/AdminTransactionsPage";
import AdminGiftingProductsPage from "@/app/components/AdminGiftingProductsPage";
import AdminGiftingProductDetailPage from "@/app/components/AdminGiftingProductDetailPage";
import AdminGiftingOrdersPage from "@/app/components/AdminGiftingOrdersPage";
import AdminGiftingVendorsPage from "@/app/components/AdminGiftingVendorsPage";
import MogzuDirectPage from "@/app/pages/admin/MogzuDirectPage";
import MogzuDirectWizardPage from "@/app/pages/admin/MogzuDirectWizardPage";
import AdminListingsPage from "@/app/pages/admin/AdminListingsPage";
import AdminListingDetailPage from "@/app/pages/admin/AdminListingDetailPage";
import AdminCategoryManagementPage from "@/app/pages/admin/AdminCategoryManagementPage";

function MogzuDirectEditLegacyRedirect() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/admin/mogzu-direct" replace />;
  return <Navigate to={`/admin/mogzu-direct/${encodeURIComponent(id)}/edit`} replace />;
}
import MogzuDirectCorporateDetailPage from "@/app/pages/MogzuDirectCorporateDetailPage";
import PartnerListingCorporateDetailPage from "@/app/pages/PartnerListingCorporateDetailPage";
import AdminPartnersPage from "@/app/pages/admin/AdminPartnersPage";
import AdminPartnerFormPage from "@/app/pages/admin/AdminPartnerFormPage";
import AdminPartnerListingsPage from "@/app/pages/admin/AdminPartnerListingsPage";
import AdminPartnerListingFormPage from "@/app/pages/admin/AdminPartnerListingFormPage";
import AdminShortlistsPage from "@/app/pages/admin/AdminShortlistsPage";
import AdminShortlistEditorPage from "@/app/pages/admin/AdminShortlistEditorPage";
import AdminMogzuOrdersPage from "@/app/pages/admin/AdminMogzuOrdersPage";
import AdminPlatformModulesPage from "@/app/pages/admin/AdminPlatformModulesPage";
import ShortlistCorporatePage from "@/app/pages/ShortlistCorporatePage";
import AdminLoginPage from "@/app/components/AdminLoginPage";
import ActivitySuite from "@/app/components/ActivitySuite";
import DSpaceHomePage from "@/app/components/DSpaceHomePage";
import SpaceXPage from "@/app/components/SpaceXPage";
import SpaceDetailPage from "@/app/components/SpaceDetailPage";
import RequestToBook from "@/app/components/RequestToBook";
import BookingAddOns from "@/app/components/BookingAddOns";
import BookingReview from "@/app/components/BookingReview";
import BookingPayment from "@/app/components/BookingPayment";
import BookingConfirmationFlowPage from "@/app/components/BookingConfirmationFlowPage";
import BookingsPage from "@/app/components/BookingsPage";
import BookingDetailPage from "@/app/components/BookingDetailPage";
import CoworkingPage from "@/app/components/CoworkingPage";
import CoworkingDetailPage from "@/app/components/CoworkingDetailPage";
import ActivitiesPage from "@/app/components/ActivitiesPage";
import ActivityDetailPage from "@/app/components/ActivityDetailPage";
import ActivityBookingFlow from "@/app/components/ActivityBookingFlow";
import StayPage from "@/app/components/StayPage";
import PromotionsPage from "@/app/components/PromotionsPage";
import GiftingPage from "@/app/components/GiftingPage";
import GiftingShopPage from "@/app/components/GiftingShopPage";
import GiftingSpecialTabsPage from "@/app/components/GiftingSpecialTabsPage";
import ProductBookingPage from "@/app/components/ProductBookingPage";
import ApparelTestPage from "@/app/components/ApparelTestPage";
import BookingFlow from "@/app/components/BookingFlow";
import EventBookingPage from "@/app/components/EventBookingPage";
import VendorBookingRequestsPage from "@/app/components/VendorBookingRequestsPage";
import AdminCommissionsPage from "@/app/components/AdminCommissionsPage";
import BookingPaymentPage from "@/app/components/BookingPaymentPage";
import CorporateGiftingProgrammePage from "@/app/components/CorporateGiftingProgrammePage";
import GiftingSendPage from "@/app/components/GiftingSendPage";
import SpaceBookingPage from "@/app/components/SpaceBookingPage";
import VendorPayoutsPage from "@/app/components/VendorPayoutsPage";
import EmployeeImportPage from "@/app/components/EmployeeImportPage";
import CelebrationsPage from "@/app/components/CelebrationsPage";
import CelebrationDetailPage from "@/app/components/CelebrationDetailPage";
import CelebrationBookingFlow from "@/app/components/CelebrationBookingFlow";
import EventsPage from "@/app/components/EventsPage";
import EventsCorporateListingPage from "@/app/components/EventsCorporateListingPage";
import EventActivityPage from "@/app/components/EventActivityPage";
import EventDetailPage from "@/app/components/EventDetailPage";
import EventServiceDetailPage from "@/app/components/EventServiceDetailPage";
import EventServicePage from "@/app/components/EventServicePage";
import EventsHomePage from "@/app/components/EventsHomePage";
import UserManagementPage from "@/app/components/UserManagementPage";
import NotFoundPage from "@/app/components/NotFoundPage";
import ErrorPage from "@/app/components/ErrorPage";
import MyProfilePage from "@/app/components/MyProfilePage";
import CompanySettingsPage from "@/app/components/CompanySettingsPage";
import CorporateDashboardLayoutPage from "@/app/components/CorporateDashboardLayoutPage";
import BillingInvoicesPage from "@/app/components/BillingInvoicesPage";
import WalletPage from "@/app/components/WalletPage";
import CommunicationPage from "@/app/components/CommunicationPage";
import FavouritesPage from "@/app/components/FavouritesPage";
import DealsPage from "@/app/components/DealsPage";
import DealClaimFlow from "@/app/components/DealClaimFlow";
import ReportsPage from "@/app/components/ReportsPage";
import MogzuAssistancePage from "@/app/components/MogzuAssistancePage";
import CorporateTransactionsPage from "@/app/components/CorporateTransactionsPage";
import CorporateNotificationsPage from "@/app/components/CorporateNotificationsPage";
import CorporateApprovalsPage from "@/app/components/CorporateApprovalsPage";
import CorporateApprovalDetailPage from "@/app/components/CorporateApprovalDetailPage";
import CorporateBudgetPage from "@/app/components/CorporateBudgetPage";

import ComparePage from "@/app/components/ComparePage";
import WishlistPage from "@/app/components/WishlistPage";
import BookingSummaryPage from "@/app/components/BookingSummaryPage";
import ApprovalWorkflowPage from "@/app/components/ApprovalWorkflowPage";
import VendorPassportPage from "@/app/components/VendorPassportPage";
import VendorWelcomePage from "@/app/components/VendorWelcomePage";
import VendorDashboardPage from "@/app/components/VendorDashboardPage";
import VendorOrdersPage from "@/app/components/VendorOrdersPage";
import VendorProductManagementPage from "@/app/components/VendorProductManagementPage";
import VendorAddProductPage from "@/app/components/VendorAddProductPage";
import VendorOrderDetailsPage from "@/app/components/VendorOrderDetailsPage";
import VendorCommunicationPage from "@/app/components/VendorCommunicationPage";
import VendorUserManagementPage from "@/app/components/VendorUserManagementPage";
import VendorPromotionsPage from "@/app/components/VendorPromotionsPage";
import VendorAdCampaignPage from "@/app/components/VendorAdCampaignPage";
import VendorPromotionOfferPage from "@/app/components/VendorPromotionOfferPage";
import VendorReviewsPage from "@/app/components/VendorReviewsPage";
import VendorCalendarPage from "@/app/components/VendorCalendarPage";
import VendorSupportPage from "@/app/components/VendorSupportPage";
import VendorEventsServicesPage from "@/app/components/VendorEventsServicesPage";
import VendorEventActivityPage from "@/app/components/VendorEventActivityPage";
import VendorSpaceXServicesPage from "@/app/components/VendorSpaceXServicesPage";
import VendorSpaceXDetailsPage from "@/app/components/VendorSpaceXDetailsPage";
import VendorGiftingDashboardPage from "@/app/components/VendorGiftingDashboardPage";
import VendorGiftingProductFormPage from "@/app/components/VendorGiftingProductFormPage";
import ApprovalRequestPage from "@/app/components/ApprovalRequestPage";

import CancelBookingPage from "@/app/components/CancelBookingPage";

import RescheduleBookingPage from "@/app/components/RescheduleBookingPage";

import GievPage from "@/app/components/GievPage";
import AdminDspacePage from "@/app/components/AdminDspacePage";
import AdminSpaceDetailPage from "@/app/components/AdminSpaceDetailPage";
import AdminDspaceBookings from "@/app/components/AdminDspaceBookings";
import AdminEventsPage from "@/app/components/AdminEventsPage";
import AdminEventDetailPage from "@/app/components/AdminEventDetailPage";
import AdminEventsBookings from "@/app/components/AdminEventsBookings";
import HeyGeniePage from "@/app/components/HeyGeniePage";
import { CorporateModuleRouteGuard } from "@/app/components/CorporateModuleRouteGuard";
import WhyMogzuPage from "@/app/components/WhyMogzuPage";
import VendorBenefitsPage from "@/app/components/VendorBenefitsPage";
import { CorporateRoute, VendorRoute, AdminRoute } from '@/app/components/auth/ProtectedRoute'
import AuthCallbackPage from '@/app/components/auth/AuthCallbackPage'
import ResetPasswordPage from '@/app/components/auth/ResetPasswordPage'

function VendorListingsRouteRedirect() {
  const profiles = getVendorListingProfileIds();
  const hasActivity = profiles.includes("activity");
  const hasEvent = profiles.includes("event");
  if (hasActivity && !hasEvent) return <Navigate to="/vendor/event-activity" replace />;
  if (hasEvent) return <Navigate to="/vendor/events" replace />;
  if (hasActivity) return <Navigate to="/vendor/event-activity" replace />;
  return <Navigate to="/vendor/dashboard" replace />;
}

function VendorSettingsStep12Placeholder() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9] px-4 font-['Inter'] text-slate-700">
      <p className="max-w-md text-center text-sm">
        Vendor account settings will be available in a future release (Step 12).
      </p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/giev",
    element: <GievPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <DSpaceHomePage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/home",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <DSpaceHomePage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/meetings",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <SpaceXPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/new",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <SpaceXPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/classic",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <SpaceXPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/classic/spaces/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <SpaceDetailPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/spaces/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <SpaceDetailPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/book/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <RequestToBook />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/heygenie",
    element: (
      <CorporateModuleRouteGuard moduleKey="heyGenie">
        <HeyGeniePage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/why-mogzu",
    element: <WhyMogzuPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor-benefits",
    element: <VendorBenefitsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPasswordPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup/corporate",
    element: <CorporateSignUpForm />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup/corporate/company-details",
    element: <CorporateCompanyDetails />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup/corporate/interests",
    element: <CorporateInterests />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup/corporate/access",
    element: <ChooseAccess />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup/vendor/register",
    element: <VendorRegisterEntryPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup/vendor",
    element: <VendorOnboardingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup/vendor/listing",
    element: <VendorSignUpForm />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup/vendor/verify-email",
    element: <VendorVerifyEmailPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/registration-complete",
    element: <VendorRegistrationCompletePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/welcome",
    element: <VendorWelcomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/verification-pending",
    element: <VendorVerificationPendingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/welcome",
    element: <WelcomeScreen />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard",
    element: <CorporateRoute><Dashboard /></CorporateRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin",
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "platform-modules", element: <AdminPlatformModulesPage /> },
      { path: "clients", element: <AdminClientManagementPage /> },
      { path: "issues", element: <AdminIssuesPage /> },
      { path: "products", element: <AdminProductsPage /> },
      { path: "products/categories", element: <AdminProductCategoriesPage /> },
      { path: "products/new", element: <AdminAddProductPage /> },
      { path: "teams", element: <AdminTeamsPage /> },
      { path: "teams/roles", element: <AdminRolePermissionsPage /> },
      { path: "vendors", element: <AdminVendorManagementDashboardPage /> },
      { path: "listings", element: <AdminListingsPage /> },
      { path: "listings/:id", element: <AdminListingDetailPage /> },
      { path: "categories", element: <AdminCategoryManagementPage /> },
      { path: "gifting/products", element: <AdminGiftingProductsPage /> },
      { path: "gifting/products/:id", element: <AdminGiftingProductDetailPage /> },
      { path: "gifting/orders", element: <AdminGiftingOrdersPage /> },
      { path: "gifting/vendors", element: <AdminGiftingVendorsPage /> },
      { path: "mogzu-direct/new", element: <MogzuDirectWizardPage /> },
      { path: "mogzu-direct/:id/edit", element: <MogzuDirectWizardPage /> },
      { path: "mogzu-direct/add", element: <Navigate to="/admin/mogzu-direct/new" replace /> },
      { path: "mogzu-direct/edit/:id", element: <MogzuDirectEditLegacyRedirect /> },
      { path: "mogzu-direct", element: <MogzuDirectPage /> },
      { path: "vendors/order-analytics", element: <AdminVendorOrderAnalyticsPage /> },
      { path: "transactions", element: <AdminTransactionsPage /> },
      { path: "promotions", element: <AdminPaidPromotionsPage /> },
      { path: "notifications", element: <AdminNotificationsPage /> },
      { path: "partners", element: <AdminPartnersPage /> },
      { path: "partners/new", element: <AdminPartnerFormPage /> },
      { path: "partners/edit/:id", element: <AdminPartnerFormPage /> },
      { path: "partner-listings", element: <AdminPartnerListingsPage /> },
      { path: "partner-listings/new", element: <AdminPartnerListingFormPage /> },
      { path: "partner-listings/edit/:id", element: <AdminPartnerListingFormPage /> },
      { path: "shortlists", element: <AdminShortlistsPage /> },
      { path: "shortlists/new", element: <AdminShortlistEditorPage /> },
      { path: "shortlists/:id", element: <AdminShortlistEditorPage /> },
      { path: "mogzu-orders", element: <AdminMogzuOrdersPage /> },
    ],
  },
  {
    path: "/activitysuite",
    element: <ActivitySuite />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <SpaceDetailPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/spacex",
    element: <Navigate to="/dspace/meetings" replace />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/spacex/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <SpaceDetailPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/request-to-book",
    element: <RequestToBook />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-addons",
    element: <BookingAddOns />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-review",
    element: <BookingReview />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-payment",
    element: <BookingPayment />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-confirmation",
    element: <BookingConfirmationFlowPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking/confirmation",
    element: <BookingConfirmationFlowPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings",
    element: <BookingsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings/:id",
    element: <BookingDetailPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/coworking",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <CoworkingPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/coworking/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <CoworkingDetailPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/activities",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <ActivitiesPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard/activities/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <ActivityDetailPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard/activities",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <ActivitiesPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard/activities/:id/booking",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <ActivityBookingFlow />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/stay",
    element: (
      <CorporateModuleRouteGuard moduleKey="dSpace">
        <StayPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/promotions",
    element: <PromotionsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/new",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/classic",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/shop",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingShopPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting-shop",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingShopPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/shop",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingShopPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/home",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/combo",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingSpecialTabsPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/e-gift",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingSpecialTabsPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/go-local",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingSpecialTabsPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/baskets",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <GiftingSpecialTabsPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/celebrations",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <CelebrationsPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/product-booking",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <ProductBookingPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/apparel",
    element: <ApparelTestPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-flow",
    element: <BookingFlow />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/book/event/:listingId",
    element: <EventBookingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/booking-requests",
    element: <VendorBookingRequestsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/booking-requests/:bookingId",
    element: <VendorBookingRequestsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin/commissions",
    element: <AdminCommissionsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings/:id/pay",
    element: <BookingPaymentPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/gifting-programme",
    element: <CorporateGiftingProgrammePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/send",
    element: <GiftingSendPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/book/space/:listingId",
    element: <SpaceBookingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/payouts",
    element: <VendorPayoutsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/employees/import",
    element: <EmployeeImportPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/celebrations",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <CelebrationsPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/celebrations/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <CelebrationDetailPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/celebration-booking-flow",
    element: (
      <CorporateModuleRouteGuard moduleKey="gifting">
        <CelebrationBookingFlow />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <EventsHomePage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/home",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <EventsHomePage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/new",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <EventsCorporateListingPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/classic",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <EventsPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/services/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <EventServiceDetailPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/book/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <BookingFlow />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/event-activity",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <EventActivityPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/event-activity/:id",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <EventDetailPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/event-services",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <EventServicePage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/activity",
    element: <Navigate to="/event-activity" replace />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/service",
    element: <Navigate to="/event-services" replace />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/user-management",
    element: <UserManagementPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/my-profile",
    element: <MyProfilePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/company-settings",
    element: <CompanySettingsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/company-settings/dashboard",
    element: <CorporateDashboardLayoutPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/billing-invoices",
    element: <BillingInvoicesPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/wallet",
    element: <WalletPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/communication",
    element: <CommunicationPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/browse/mogzu-direct/:module/:id",
    element: <MogzuDirectCorporateDetailPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/browse/partner-listing/:id",
    element: <PartnerListingCorporateDetailPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/shortlist/:token",
    element: <ShortlistCorporatePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/favourites",
    element: <FavouritesPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/report",
    element: <ReportsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/assistance",
    element: <MogzuAssistancePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/transactions",
    element: <CorporateTransactionsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/notifications",
    element: <CorporateNotificationsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/approvals",
    element: <CorporateApprovalsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/approvals/:id",
    element: <CorporateApprovalDetailPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/budget",
    element: <CorporateBudgetPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/deals",
    element: <DealsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/deals/claim/:id",
    element: <DealClaimFlow />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/compare",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <ComparePage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/wishlist",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <WishlistPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking/new",
    element: (
      <CorporateModuleRouteGuard moduleKey="events">
        <BookingSummaryPage />
      </CorporateModuleRouteGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/settings/workflow",
    element: <ApprovalWorkflowPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/dashboard",
    element: <VendorRoute><VendorDashboardPage /></VendorRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/products",
    element: <VendorProductManagementPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/products/new",
    element: <VendorAddProductPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/products/:productId",
    element: <VendorAddProductPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/orders",
    element: <VendorOrdersPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/orders/:orderId",
    element: <VendorOrderDetailsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/communication",
    element: <VendorCommunicationPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/messages",
    element: <VendorCommunicationPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/users",
    element: <VendorUserManagementPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/team",
    element: <VendorUserManagementPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/settings",
    element: <VendorSettingsStep12Placeholder />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/listings",
    element: <VendorListingsRouteRedirect />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/listings/new",
    element: <Navigate to="/vendor/products/new" replace />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/listings/:id/edit",
    element: <Navigate to="/vendor/products/:id" replace />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/events",
    element: <VendorEventsServicesPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/events/services/new",
    element: <VendorEventsServicesPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/events/services/:id",
    element: <VendorEventsServicesPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/event-activity",
    element: <VendorEventActivityPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/dspace",
    element: <VendorSpaceXServicesPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/dspace/spaces/new",
    element: <VendorSpaceXServicesPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/dspace/spaces/:id",
    element: <VendorSpaceXDetailsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/spacex",
    element: <VendorSpaceXServicesPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/spacex/:spaceId",
    element: <VendorSpaceXDetailsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/gifting",
    element: <VendorGiftingDashboardPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/gifting/products/new",
    element: <VendorGiftingProductFormPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/gifting/products/:id",
    element: <VendorGiftingProductFormPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/promotions",
    element: <VendorPromotionsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/promotions/ad-campaign",
    element: <VendorAdCampaignPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/promotions/offer",
    element: <VendorPromotionOfferPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/reviews",
    element: <VendorReviewsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/calendar",
    element: <VendorCalendarPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/support",
    element: <VendorSupportPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin/dspace",
    element: <AdminDspacePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin/dspace/spaces/:id",
    element: <AdminSpaceDetailPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin/dspace/bookings",
    element: <AdminDspaceBookings />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin/events",
    element: <AdminEventsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin/events/services/:id",
    element: <AdminEventDetailPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin/events/bookings",
    element: <AdminEventsBookings />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor-passport",
    element: <VendorPassportPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-approval-request",
    element: <ApprovalRequestPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings/:id/cancel",
    element: <CancelBookingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cancel-booking",
    element: <CancelBookingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings/:id/reschedule",
    element: <RescheduleBookingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/reschedule-booking",
    element: <RescheduleBookingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);