import { createBrowserRouter, Navigate, useParams } from "react-router";
import { lazy, Suspense } from "react";
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
import AdminHeyGenieConfigPage from "@/app/components/AdminHeyGenieConfigPage";
import AmShortlistsPage from "@/app/components/AmShortlistsPage";
import ShortlistShareView from "@/app/components/ShortlistShareView";
import PartnerSignUpForm from "@/app/components/PartnerSignUpForm";
import PartnerDashboardPage from "@/app/components/PartnerDashboardPage";
import PartnerReferralIntakePage from "@/app/components/PartnerReferralIntakePage";
import PartnerClientsPage from "@/app/components/PartnerClientsPage";
import PartnerListingsPage from "@/app/components/PartnerListingsPage";
import PartnerListingFormPage from "@/app/components/PartnerListingFormPage";
import PartnerInvoicePage from "@/app/components/PartnerInvoicePage";
import PartnerStatementPage from "@/app/components/PartnerStatementPage";
import AdminPartnerAgreementPage from "@/app/pages/admin/AdminPartnerAgreementPage";
import AdminPartnerPayoutsPage from "@/app/pages/admin/AdminPartnerPayoutsPage";
import AdminPendingListingsPage from "@/app/pages/admin/AdminPendingListingsPage";
import AdminTeamPage from "@/app/pages/admin/AdminTeamPage";
import AdminTeamPermissionsPage from "@/app/pages/admin/AdminTeamPermissionsPage";
import AdminTeamActivityPage from "@/app/pages/admin/AdminTeamActivityPage";
import AdminQuickSharePage from "@/app/pages/admin/AdminQuickSharePage";
import AdminQuickShareDetailPage from "@/app/pages/admin/AdminQuickShareDetailPage";
import QuickShareViewerPage from "@/app/components/QuickShareViewerPage";
import AcceptInvitePage from "@/app/components/AcceptInvitePage";
import FieldAgentDashboardPage from "@/app/components/FieldAgentDashboardPage";
import BookingTrackerPage from "@/app/components/BookingTrackerPage";
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
import ClassicBookingSuccessPage from "@/app/components/ClassicBookingSuccessPage";
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
import VendorPayoutMethodsPage from "@/app/components/VendorPayoutMethodsPage";
import EmployeeImportPage from "@/app/components/EmployeeImportPage";
import NotificationsPage from "@/app/components/NotificationsPage";
import NotificationPreferencesPage from "@/app/components/NotificationPreferencesPage";
import EmployeeSpendPage from "@/app/components/EmployeeSpendPage";
import CorporateSpendReportPage from "@/app/components/CorporateSpendReportPage";
import SupportPage, { VendorSupportPage } from "@/app/components/SupportPage";
import AdminSupportPage from "@/app/components/AdminSupportPage";
import CorporateCelebrationsPage from "@/app/components/CorporateCelebrationsPage";
import ManagerCelebrationsPage from "@/app/components/ManagerCelebrationsPage";
import AccountManagerPortfolioPage from "@/app/components/AccountManagerPortfolioPage";
import CorporateTravelPolicyPage from "@/app/components/CorporateTravelPolicyPage";
import StaySearchPage from "@/app/components/StaySearchPage";
import AdminDisputesPage from "@/app/components/AdminDisputesPage";
import BulkGiftingPage from "@/app/components/BulkGiftingPage";
import ReviewSubmitPage from "@/app/components/ReviewSubmitPage";
import AdminReviewsApprovalPage from "@/app/components/AdminReviewsApprovalPage";
import VendorAnalyticsPage from "@/app/components/VendorAnalyticsPage";
import VendorPromotionsRealPage from "@/app/components/VendorPromotionsRealPage";
import AdminPromotionsApprovalPage from "@/app/components/AdminPromotionsApprovalPage";
import AdminBrandingApprovalsPage from "@/app/components/AdminBrandingApprovalsPage";
import AdminCmsPage from "@/app/components/AdminCmsPage";
import AdminAiAgentsPage from "@/app/components/AdminAiAgentsPage";
import ExplorePage from "@/app/components/ExplorePage";
import AdminSsoPage from "@/app/components/AdminSsoPage";
import AdminPublicListingsPage from "@/app/components/AdminPublicListingsPage";
import PublicLandingPage from "@/app/components/PublicLandingPage";
import PublicSecurityPage from "@/app/components/PublicSecurityPage";
import SalesPipelinePage from "@/app/components/SalesPipelinePage";
import PublicBlogIndexPage from "@/app/components/PublicBlogIndexPage";
import AdminLeadsPage from "@/app/components/AdminLeadsPage";
import AdminAuditPage from "@/app/components/AdminAuditPage";
import AdminContractsPage from "@/app/components/AdminContractsPage";
import AdminContractFormPage from "@/app/components/AdminContractFormPage";
import AdminSubscriptionsPage from "@/app/components/AdminSubscriptionsPage";
import AdminFinanceReconciliationPage from "@/app/components/AdminFinanceReconciliationPage";
import AdminFinanceFxPage from "@/app/components/AdminFinanceFxPage";
import AdminApiKeysPage from "@/app/components/AdminApiKeysPage";
import AdminWebhooksPage from "@/app/components/AdminWebhooksPage";
import AdminVendorPayoutsPage from "@/app/components/AdminVendorPayoutsPage";
import PublicVendorApplyPage from "@/app/components/PublicVendorApplyPage";
import AdminVendorApplicationsPage from "@/app/components/AdminVendorApplicationsPage";
import AdminWhiteLabelPage from "@/app/components/AdminWhiteLabelPage";
import CorporateAiAutonomyPage from "@/app/components/CorporateAiAutonomyPage";
import AdminAccessReviewsPage from "@/app/components/AdminAccessReviewsPage";
import AdminInvoiceRunPage from "@/app/components/AdminInvoiceRunPage";
import CorporateEventTemplatesPage from "@/app/components/CorporateEventTemplatesPage";
import CorporatePicksPage from "@/app/components/CorporatePicksPage";
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
import AccountBillingPage from "@/app/components/AccountBillingPage";
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
import AdminBookingsPage from "@/app/components/AdminBookingsPage";
import AdminReportsPage from "@/app/components/AdminReportsPage";
import AdminSettingsPage from "@/app/components/AdminSettingsPage";
import VendorPerformancePage from "@/app/components/VendorPerformancePage";
import VendorSettingsPage from "@/app/components/VendorSettingsPage";
import AdminEventsPage from "@/app/components/AdminEventsPage";
import AdminEventDetailPage from "@/app/components/AdminEventDetailPage";
import AdminEventsBookings from "@/app/components/AdminEventsBookings";
import HeyGeniePage from "@/app/components/HeyGeniePage";
import { CorporateModuleRouteGuard } from "@/app/components/CorporateModuleRouteGuard";
import WhyMogzuPage from "@/app/components/WhyMogzuPage";
import VendorBenefitsPage from "@/app/components/VendorBenefitsPage";
import { CorporateRoute, VendorRoute, AdminRoute } from '@/app/components/auth/ProtectedRoute'
import { corp, vend, adminPage, redirectTo } from '@/app/lib/routeWrappers'
import { PartnerRoute } from '@/app/components/auth/PartnerRoute'
import { AccountManagerRoute } from '@/app/components/auth/AccountManagerRoute'
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
      corp(<DSpaceHomePage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/home",
    element: (
      corp(<DSpaceHomePage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/meetings",
    element: (
      corp(<SpaceXPage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/new",
    element: (
      corp(<SpaceXPage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/classic",
    element: (
      corp(<SpaceXPage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/classic/spaces/:id",
    element: (
      corp(<SpaceDetailPage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/spaces/:id",
    element: (
      corp(<SpaceDetailPage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/book/:id",
    element: (
      corp(<RequestToBook />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/heygenie",
    element: (
      corp(<HeyGeniePage />, 'heyGenie')
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
  // DEV-ONLY demo persona selector — hot-loaded only in development builds
  ...(import.meta.env.DEV
    ? [{
        path: '/demo-login',
        element: (() => {
          const DemoLoginPage = lazy(() => import('@/app/components/DemoLoginPage'))
          return <Suspense fallback={null}><DemoLoginPage /></Suspense>
        })(),
        errorElement: <ErrorPage />,
      }]
    : []),
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
    element: corp(<Dashboard />),
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
      { path: "heygenie", element: <AdminHeyGenieConfigPage /> },
      { path: "partners/:id/agreement", element: <AdminPartnerAgreementPage /> },
      { path: "partner-payouts", element: <AdminPartnerPayoutsPage /> },
      { path: "listings/queue", element: <AdminPendingListingsPage /> },
      { path: "team", element: <AdminTeamPage /> },
      { path: "team/:userId/permissions", element: <AdminTeamPermissionsPage /> },
      { path: "team/:userId/activity", element: <AdminTeamActivityPage /> },
      { path: "quick-share", element: <AdminQuickSharePage /> },
      { path: "quick-share/:id", element: <AdminQuickShareDetailPage /> },
      { path: "mogzu-orders", element: <AdminMogzuOrdersPage /> },
      { path: "commissions", element: <AdminCommissionsPage /> },
      { path: "support", element: <AdminSupportPage /> },
      { path: "support/:id", element: <AdminSupportPage /> },
      { path: "disputes", element: <AdminDisputesPage /> },
      { path: "disputes/:id", element: <AdminDisputesPage /> },
      { path: "reviews/approval", element: <AdminReviewsApprovalPage /> },
      { path: "promotions/approval", element: <AdminPromotionsApprovalPage /> },
      { path: "branding/approvals", element: <AdminBrandingApprovalsPage /> },
      { path: "cms", element: <AdminCmsPage /> },
      { path: "ai-agents", element: <AdminAiAgentsPage /> },
      { path: "sso", element: <AdminSsoPage /> },
      { path: "listings/public", element: <AdminPublicListingsPage /> },
      { path: "leads", element: <AdminLeadsPage /> },
      { path: "compliance/audit", element: <AdminAuditPage /> },
      { path: "contracts", element: <AdminContractsPage /> },
      { path: "contracts/new", element: <AdminContractFormPage /> },
      { path: "contracts/:id/edit", element: <AdminContractFormPage /> },
      { path: "invoice-runs/:id", element: <AdminInvoiceRunPage /> },
      { path: "subscriptions", element: <AdminSubscriptionsPage /> },
      { path: "finance/reconciliation", element: <AdminFinanceReconciliationPage /> },
      { path: "finance/fx", element: <AdminFinanceFxPage /> },
      { path: "api-keys", element: <AdminApiKeysPage /> },
      { path: "webhooks", element: <AdminWebhooksPage /> },
      { path: "vendor-payouts", element: <AdminVendorPayoutsPage /> },
      { path: "vendor-applications", element: <AdminVendorApplicationsPage /> },
      { path: "white-label", element: <AdminWhiteLabelPage /> },
      { path: "access-reviews", element: <AdminAccessReviewsPage /> },
      { path: "dspace", element: <AdminDspacePage /> },
      { path: "dspace/spaces/:id", element: <AdminSpaceDetailPage /> },
      { path: "dspace/bookings", element: <AdminDspaceBookings /> },
      { path: "bookings", element: <AdminBookingsPage /> },
      { path: "reports", element: <AdminReportsPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
      { path: "events", element: <AdminEventsPage /> },
      { path: "events/services/:id", element: <AdminEventDetailPage /> },
      { path: "events/bookings", element: <AdminEventsBookings /> },
    ],
  },
  {
    path: "/am/shortlists",
    element: <AccountManagerRoute><AmShortlistsPage /></AccountManagerRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/am/shortlists/:id",
    element: <AccountManagerRoute><AmShortlistsPage /></AccountManagerRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/shortlist/:token",
    element: <ShortlistShareView />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup/partner",
    element: <PartnerSignUpForm />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/partner-ref/:code",
    element: <PartnerReferralIntakePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/partner/dashboard",
    element: <PartnerRoute><PartnerDashboardPage /></PartnerRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/partner/clients",
    element: <PartnerRoute><PartnerClientsPage /></PartnerRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/partner/listings",
    element: <PartnerRoute><PartnerListingsPage /></PartnerRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/partner/listings/new",
    element: <PartnerRoute><PartnerListingFormPage /></PartnerRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/partner/listings/:id/edit",
    element: <PartnerRoute><PartnerListingFormPage /></PartnerRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/invoice/:token",
    element: corp(<PartnerInvoicePage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/partner/statements/:yyyymm",
    element: <PartnerRoute><PartnerStatementPage /></PartnerRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/invite/:token",
    element: corp(<AcceptInvitePage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/agent/dashboard",
    element: <FieldAgentDashboardPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings/:id/track",
    element: corp(<BookingTrackerPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/qs/:token",
    element: corp(<QuickShareViewerPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/activitysuite",
    element: corp(<ActivitySuite />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dspace/:id",
    element: (
      corp(<SpaceDetailPage />, 'dSpace')
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
      corp(<SpaceDetailPage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/request-to-book",
    element: corp(<RequestToBook />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-addons",
    element: corp(<BookingAddOns />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-review",
    element: corp(<BookingReview />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-payment",
    element: corp(<BookingPayment />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-confirmation",
    element: corp(<BookingConfirmationFlowPage />),
    errorElement: <ErrorPage />,
  },
  {
    // canonical redirect — old alias kept for deep-links
    path: "/booking/confirmation",
    element: corp(<BookingConfirmationFlowPage />),
    errorElement: <ErrorPage />,
  },
  {
    // classic flow (RequestToBook → AddOns → Review → Payment) success page
    path: "/booking-success",
    element: corp(<ClassicBookingSuccessPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings",
    element: corp(<BookingsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings/:id",
    element: corp(<BookingDetailPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/coworking",
    element: (
      corp(<CoworkingPage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/coworking/:id",
    element: (
      corp(<CoworkingDetailPage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/activities",
    element: (
      corp(<ActivitiesPage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard/activities/:id",
    element: (
      corp(<ActivityDetailPage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard/activities",
    element: (
      corp(<ActivitiesPage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard/activities/:id/booking",
    element: (
      corp(<ActivityBookingFlow />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/stay",
    element: (
      corp(<StayPage />, 'dSpace')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/promotions",
    element: corp(<PromotionsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting",
    element: (
      corp(<GiftingPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/new",
    element: (
      corp(<GiftingPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/classic",
    element: (
      corp(<GiftingPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/shop",
    element: (
      corp(<GiftingShopPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting-shop",
    element: (
      corp(<GiftingShopPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/shop",
    element: (
      corp(<GiftingShopPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/home",
    element: (
      corp(<GiftingPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/combo",
    element: (
      corp(<GiftingSpecialTabsPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/e-gift",
    element: (
      corp(<GiftingSpecialTabsPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/go-local",
    element: (
      corp(<GiftingSpecialTabsPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/baskets",
    element: (
      corp(<GiftingSpecialTabsPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/celebrations",
    element: (
      corp(<CelebrationsPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/product-booking",
    element: (
      corp(<ProductBookingPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/apparel",
    element: corp(<ApparelTestPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-flow",
    element: corp(<BookingFlow />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/book/event/:listingId",
    element: corp(<EventBookingPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/booking-requests",
    element: vend(<VendorBookingRequestsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/booking-requests/:bookingId",
    element: vend(<VendorBookingRequestsPage />),
    errorElement: <ErrorPage />,
  },
  ,
  {
    path: "/bookings/:id/pay",
    element: corp(<BookingPaymentPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/gifting-programme",
    element: corp(<CorporateGiftingProgrammePage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/gifting/send",
    element: corp(<GiftingSendPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/book/space/:listingId",
    element: corp(<SpaceBookingPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/payouts",
    element: vend(<VendorPayoutsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/payout-methods",
    element: vend(<VendorPayoutMethodsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/employees/import",
    element: corp(<EmployeeImportPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/notifications",
    element: redirectTo("/corporate/notifications"),
    errorElement: <ErrorPage />,
  },
  {
    path: "/settings/notifications",
    element: corp(<NotificationPreferencesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/spend",
    element: corp(<EmployeeSpendPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/spend-report",
    element: corp(<CorporateSpendReportPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/support",
    element: corp(<SupportPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/support/:id",
    element: corp(<SupportPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/support",
    element: vend(<VendorSupportPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/support/:id",
    element: vend(<VendorSupportPage />),
    errorElement: <ErrorPage />,
  },
  ,
  ,
  {
    path: "/corporate/celebrations",
    element: corp(<CorporateCelebrationsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/celebrations/team",
    element: corp(<ManagerCelebrationsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/am/portfolio",
    element: <AccountManagerPortfolioPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/travel-policy",
    element: corp(<CorporateTravelPolicyPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/stay/search",
    element: corp(<StaySearchPage />, 'dSpace'),
    errorElement: <ErrorPage />,
  },
  ,
  ,
  {
    path: "/corporate/bulk-gifting",
    element: corp(<BulkGiftingPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/bulk-gifting/:id",
    element: corp(<BulkGiftingPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings/:id/review",
    element: corp(<ReviewSubmitPage />),
    errorElement: <ErrorPage />,
  },
  ,
  {
    path: "/vendor/analytics",
    element: vend(<VendorAnalyticsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/promotions-live",
    element: vend(<VendorPromotionsRealPage />),
    errorElement: <ErrorPage />,
  },
  ,
  ,
  ,
  ,
  {
    path: "/explore",
    element: corp(<ExplorePage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/explore/:module",
    element: corp(<ExplorePage />),
    errorElement: <ErrorPage />,
  },
  ,
  ,
  {
    path: "/p/:slug",
    element: <PublicLandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/blog",
    element: <PublicBlogIndexPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/blog/:slug",
    element: <PublicLandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/security",
    element: <PublicSecurityPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/sales/pipeline",
    element: corp(<SalesPipelinePage />),
    errorElement: <ErrorPage />,
  },
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  {
    path: "/vendor-apply",
    element: <PublicVendorApplyPage />,
    errorElement: <ErrorPage />,
  },
  ,
  ,
  {
    path: "/corporate/ai-autonomy",
    element: corp(<CorporateAiAutonomyPage />),
    errorElement: <ErrorPage />,
  },
  ,
  {
    path: "/corporate/event-templates",
    element: corp(<CorporateEventTemplatesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate-picks",
    element: corp(<CorporatePicksPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/celebrations",
    element: (
      corp(<CelebrationsPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/celebrations/:id",
    element: (
      corp(<CelebrationDetailPage />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/celebration-booking-flow",
    element: (
      corp(<CelebrationBookingFlow />, 'gifting')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events",
    element: (
      corp(<EventsHomePage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/home",
    element: (
      corp(<EventsHomePage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/new",
    element: (
      corp(<EventsCorporateListingPage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/classic",
    element: (
      corp(<EventsPage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/services/:id",
    element: (
      corp(<EventServiceDetailPage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/events/book/:id",
    element: (
      corp(<BookingFlow />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/event-activity",
    element: (
      corp(<EventActivityPage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/event-activity/:id",
    element: (
      corp(<EventDetailPage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/event-services",
    element: (
      corp(<EventServicePage />, 'events')
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
    element: corp(<UserManagementPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/my-profile",
    element: corp(<MyProfilePage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/company-settings",
    element: corp(<CompanySettingsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/company-settings/dashboard",
    element: corp(<CorporateDashboardLayoutPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/billing-invoices",
    element: corp(<BillingInvoicesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/account/invoices",
    element: corp(<BillingInvoicesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/account/billing",
    element: corp(<AccountBillingPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/wallet",
    element: corp(<WalletPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/communication",
    element: corp(<CommunicationPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/browse/mogzu-direct/:module/:id",
    element: corp(<MogzuDirectCorporateDetailPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/browse/partner-listing/:id",
    element: corp(<PartnerListingCorporateDetailPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/shortlist/:token",
    element: corp(<ShortlistCorporatePage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/favourites",
    element: corp(<FavouritesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/report",
    element: corp(<ReportsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/assistance",
    element: redirectTo("/heygenie"),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/transactions",
    element: corp(<CorporateTransactionsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/notifications",
    element: corp(<CorporateNotificationsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/approvals",
    element: corp(<CorporateApprovalsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/approvals/:id",
    element: corp(<CorporateApprovalDetailPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/corporate/budget",
    element: corp(<CorporateBudgetPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/deals",
    element: corp(<DealsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/deals/claim/:id",
    element: corp(<DealClaimFlow />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/compare",
    element: (
      corp(<ComparePage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/wishlist",
    element: (
      corp(<WishlistPage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking/new",
    element: (
      corp(<BookingSummaryPage />, 'events')
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/settings/workflow",
    element: corp(<ApprovalWorkflowPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/dashboard",
    element: vend(<VendorRoute><VendorDashboardPage /></VendorRoute>),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/products",
    element: vend(<VendorProductManagementPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/products/new",
    element: vend(<VendorAddProductPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/products/:productId",
    element: vend(<VendorAddProductPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/orders",
    element: vend(<VendorOrdersPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/orders/:orderId",
    element: vend(<VendorOrderDetailsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/communication",
    element: vend(<VendorCommunicationPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/messages",
    element: vend(<VendorCommunicationPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/users",
    element: vend(<VendorUserManagementPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/team",
    element: vend(<VendorUserManagementPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/settings",
    element: vend(<VendorSettingsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/listings",
    element: vend(<VendorListingsRouteRedirect />),
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
    element: vend(<VendorEventsServicesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/events/services/new",
    element: vend(<VendorEventsServicesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/events/services/:id",
    element: vend(<VendorEventsServicesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/event-activity",
    element: vend(<VendorEventActivityPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/dspace",
    element: vend(<VendorSpaceXServicesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/dspace/spaces/new",
    element: vend(<VendorSpaceXServicesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/dspace/spaces/:id",
    element: vend(<VendorSpaceXDetailsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/spacex",
    element: vend(<VendorSpaceXServicesPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/spacex/:spaceId",
    element: vend(<VendorSpaceXDetailsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/gifting",
    element: vend(<VendorGiftingDashboardPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/gifting/products/new",
    element: vend(<VendorGiftingProductFormPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/gifting/products/:id",
    element: vend(<VendorGiftingProductFormPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/promotions",
    element: vend(<VendorPromotionsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/promotions/ad-campaign",
    element: vend(<VendorAdCampaignPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/promotions/offer",
    element: vend(<VendorPromotionOfferPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/reviews",
    element: vend(<VendorReviewsPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vendor/calendar",
    element: vend(<VendorCalendarPage />),
    errorElement: <ErrorPage />,
  },
  ,
  ,
  ,
  ,
  ,
  ,
  {
    path: "/vendor/performance",
    element: vend(<VendorPerformancePage />),
    errorElement: <ErrorPage />,
  },
  ,
  ,
  ,
  {
    path: "/vendor-passport",
    element: <VendorPassportPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-approval-request",
    element: corp(<ApprovalRequestPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings/:id/cancel",
    element: corp(<CancelBookingPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/cancel-booking",
    element: corp(<CancelBookingPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/bookings/:id/reschedule",
    element: corp(<RescheduleBookingPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/reschedule-booking",
    element: corp(<RescheduleBookingPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);