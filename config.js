/*
  CAFE REVIEW SYSTEM — CAFE CONFIGURATION

  Edit this file for each cafe.

  IMPORTANT:
  - Do NOT put any AI API key here.
  - Do NOT put any secret/private key here.
  - This file is public because it runs in the customer's browser.
*/

window.CAFE_CONFIG = {

  // =========================
  // CAFE BASIC INFORMATION
  // =========================

  name: "Ember & Bean",

  location: "Jaipur · Café & Coffee",


  // =========================
  // CAFE LOGO
  // =========================

  // Leave blank to use the text logo.
  // Example:
  // logo: "https://example.com/logo.png"

  logo: "",


  // =========================
  // GOOGLE REVIEW LINK
  // =========================

  // Paste the cafe's actual Google review link here.
  //
  // Example:
  // googleReviewUrl: "https://g.page/r/XXXXXXXX/review"

  googleReviewUrl: "https://maps.app.goo.gl/ScXeqAGpBtousq37A?g_st=ac",


  // =========================
  // SOCIAL MEDIA LINKS
  // =========================

  social: {

    instagram: "https://instagram.com/",

    facebook: "https://facebook.com/",

    youtube: "https://youtube.com/",

    whatsapp: "https://wa.me/91XXXXXXXXXX"

  },


  // =========================
  // MENU / ITEMS
  // =========================
  //
  // These items appear under:
  // "What did you have?"
  //
  // You can add/remove items later.

  menuItems: [

    {
      name: "Coffee",
      icon: "☕"
    },

    {
      name: "Cold Coffee",
      icon: "🧊"
    },

    {
      name: "Pizza",
      icon: "🍕"
    },

    {
      name: "Pasta",
      icon: "🍝"
    },

    {
      name: "Dessert",
      icon: "🍰"
    },

    {
      name: "Snacks",
      icon: "🥐"
    }

  ],


  // =========================
  // GOOGLE SHEETS / APPS SCRIPT
  // =========================
  //
  // This URL connects the review website
  // with the Google Apps Script Web App.
  //
  // It records:
  // - Scan
  // - Review generated
  // - Review regenerated
  // - Review edited
  // - Google button click
  // - Social clicks
  //
  // Keep the /exec at the end.

  sheetsWebAppUrl:
    "https://script.google.com/macros/s/AKfycbwpccxpXds15apsqtfQIG6vouTh5MTuJlD8SzXC76nlinDuzLPYq9rVt0kXY9Q6dykViQ/exec"

};
