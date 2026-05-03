export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export const pageview = () => {
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// https://developers.facebook.com/docs/facebook-pixel/reference
export const event = (name, options = {}) => {
  if (window.fbq) {
    window.fbq('track', name, options);
  }
};
