const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://ragas-backend-api.onrender.com/api',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  emailjsServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  emailjsResetTemplateId: import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID || '',
  emailjsWelcomeTemplateId: import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID || '',
  emailjsPublicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  apkDownloadUrl: import.meta.env.VITE_APK_DOWNLOAD_URL || 'https://github.com/Kaushik2105/Ragas-Mobile/releases/download/v2.0.1/ragas-v2.0.1.apk',
};

export default config;
