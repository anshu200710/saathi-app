export const appRoutes = {
  // Auth
  LOGIN: '(auth)/login',
  VERIFY_OTP: '(auth)/verify-otp',
  BUSINESS_PROFILE: '(auth)/business-profile',
  
  // User
  HOME: '(user)/home',
  SERVICES: '(user)/services',
  SERVICE_DETAIL: '(user)/services/[id]',
  FUNDING: '(user)/funding',
  FUNDING_DETAIL: '(user)/funding/[id]',
  FUNDING_ELIGIBILITY: '(user)/funding/eligibility',
  COMPLIANCE: '(user)/compliance',
  DOCUMENTS: '(user)/documents',
  TOOLS: '(user)/tools',
  PLANS: '(user)/plans',
  SUPPORT: '(user)/support',
  NOTIFICATIONS: '(user)/notifications',
  PROFILE: '(user)/profile',
  
  // Admin
  ADMIN_DASHBOARD: '(admin)/dashboard',
  ADMIN_USERS: '(admin)/users',
  ADMIN_SERVICES: '(admin)/services',
  ADMIN_FUNDING: '(admin)/funding',
  ADMIN_PAYMENTS: '(admin)/payments',
  ADMIN_NOTIFICATIONS: '(admin)/notifications',
};
