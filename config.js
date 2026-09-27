/*
  CAFE CONFIGURATION

  Edit only this file when setting up a cafe.

  IMPORTANT:
  - Do NOT put an AI API key here.
  - Do NOT put a secret/private key here.
  - This file is public because it runs in the customer's browser.
*/

const CAFE_CONFIG = {
  name: "Ember & Bean",
  location: "Jaipur · Café & Coffee",

  // Optional. Leave blank to keep the E&B text logo.
  logo: "",

  // Paste the cafe's Google Business Profile review link here.
  googleReviewUrl: "PASTE_GOOGLE_REVIEW_LINK_HERE",

  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
    whatsapp: "https://wa.me/91XXXXXXXXXX"
  },

  // Items shown in Step 03.
  menuItems: [
    { name: "Coffee", icon: "☕" },
    { name: "Cold Coffee", icon: "🧊" },
    { name: "Pizza", icon: "🍕" },
    { name: "Pasta", icon: "🍝" },
    { name: "Dessert", icon: "🍰" },
    { name: "Snacks", icon: "🥐" }
  ],

  // Optional Google Apps Script Web App URL.
  // Leave blank until Part 4 / Sheets setup.
  sheetsWebAppUrl: "https://script.google.com/macros/s/AKfycbwpccxpXds15apsqtfQIG6vouTh5MTuJlD8SzXC76nlinDuzLPYq9rVt0kXY9Q6dykViQ/exec"
};
