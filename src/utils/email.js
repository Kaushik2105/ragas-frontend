import emailjs from '@emailjs/browser';

export const EMAILJS_SERVICE_ID = 'service_assbfr8';
export const EMAILJS_RESET_TEMPLATE_ID = 'template_2gqin32';
export const EMAILJS_WELCOME_TEMPLATE_ID = 'template_3lq6w1v';
export const EMAILJS_PUBLIC_KEY = 'ocRaySd72sJfW-_7m';

const hasEmailConfig = (templateId) =>
  templateId &&
  !templateId.startsWith('TODO_') &&
  EMAILJS_PUBLIC_KEY &&
  !EMAILJS_PUBLIC_KEY.startsWith('TODO_');

export const sendWelcomeEmail = async ({ email, name }) => {
  if (!hasEmailConfig(EMAILJS_WELCOME_TEMPLATE_ID)) return;

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_WELCOME_TEMPLATE_ID,
    {
      to_email: email,
      to_name: name || email,
      app_name: 'RAGAS',
      login_link: window.location.origin,
    },
    EMAILJS_PUBLIC_KEY
  );
};

export const sendResetEmail = async ({ email, name, resetLink }) => {
  if (!hasEmailConfig(EMAILJS_RESET_TEMPLATE_ID)) return;

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_RESET_TEMPLATE_ID,
    {
      to_email: email,
      to_name: name || email,
      reset_link: resetLink,
      app_name: 'RAGAS',
    },
    EMAILJS_PUBLIC_KEY
  );
};
