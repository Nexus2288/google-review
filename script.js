// ============================================================
// CAFE REVIEW SYSTEM
// GEMINI AI VERSION
// ============================================================

const state = {
  rating: 0,
  experiences: [],
  items: [],
  note: "",
  generated: false,
  version: 0,
  scanId: createScanId()
};

// ============================================================
// ELEMENTS
// ============================================================

const els = {
  cafeName: document.getElementById("cafeName"),
  cafeLocation: document.getElementById("cafeLocation"),
  brandMark: document.getElementById("brandMark"),
  footerCafeName: document.getElementById("footerCafeName"),

  stars: [...document.querySelectorAll(".star")],
  ratingLabel: document.getElementById("ratingLabel"),

  experienceChips: [
    ...document.querySelectorAll(
      "#experienceChips .chip"
    )
  ],

  itemChips: document.getElementById("itemChips"),

  note: document.getElementById("note"),
  charCount: document.getElementById("charCount"),

  generateButton:
    document.getElementById("generateButton"),

  preview:
    document.getElementById("reviewPreview"),

  reviewText:
    document.getElementById("reviewText"),

  editButton:
    document.getElementById("editButton"),

  regenerateButton:
    document.getElementById("regenerateButton"),

  googleButton:
    document.getElementById("googleButton"),

  socialButtons:
    document.querySelector(".social-grid"),

  socialTitle:
    document.getElementById("socialTitle")
};


// ============================================================
// CREATE SCAN ID
// ============================================================

function createScanId() {

  return (
    "SCAN-" +
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 8)
  ).toUpperCase();

}


// ============================================================
// CONFIG
// ============================================================

function getConfig() {

  return window.CAFE_CONFIG || {};

}


// ============================================================
// APPLY CAFE CONFIG
// ============================================================

function applyCafeConfig() {

  const config = getConfig();

  // Cafe name
  if (els.cafeName) {

    els.cafeName.textContent =
      config.name || "Cafe";

  }


  // Location
  if (els.cafeLocation) {

    els.cafeLocation.textContent =
      config.location || "";

  }


  // Footer
  if (els.footerCafeName) {

    els.footerCafeName.textContent =
      config.name || "Cafe";

  }


  // Logo
  if (
    els.brandMark &&
    config.logo
  ) {

    els.brandMark.innerHTML = "";

    const img =
      document.createElement("img");

    img.src = config.logo;

    img.alt =
      config.name || "Cafe logo";

    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.style.objectFit = "contain";

    els.brandMark.appendChild(img);

  }


  // Social title
  if (els.socialTitle) {

    els.socialTitle.textContent =
      `Follow ${config.name || "us"}`;

  }


  // ==========================================================
  // MENU ITEMS
  // ==========================================================

  if (els.itemChips) {

    els.itemChips.innerHTML = "";

    const menuItems =
      Array.isArray(config.menuItems)
        ? config.menuItems
        : [];


    menuItems.forEach(item => {

      const button =
        document.createElement("button");

      button.type = "button";

      button.className =
        "chip item-chip";


      button.dataset.value =
        item.name || "";


      button.innerHTML = `
        <span>${item.icon || "☕"}</span>
        <span>${item.name || ""}</span>
      `;


      button.addEventListener(
        "click",
        () => {

          toggleItemChip(button);

        }
      );


      els.itemChips.appendChild(button);

    });

  }


  // ==========================================================
  // SOCIAL LINKS
  // ==========================================================

  setupSocialLinks();

}


// ============================================================
// SOCIAL LINKS
// ============================================================

function setupSocialLinks() {

  const config = getConfig();

  if (!els.socialButtons) return;

  const social =
    config.social || {};


  const buttons =
    els.socialButtons.querySelectorAll(
      ".social-button"
    );


  buttons.forEach(button => {

    const platform =
      button.dataset.social;


    if (!platform) return;


    const url =
      social[platform];


    if (!url) {

      button.style.display = "none";

      return;

    }


    button.href = url;

    button.target = "_blank";

    button.rel =
      "noopener noreferrer";


    button.addEventListener(
      "click",
      () => {

        logEvent({

          event: "social_click",

          platform: platform

        });

      }
    );

  });

}


// ============================================================
// EXPERIENCE CHIP
// IMPORTANT:
// HTML ALREADY CONTAINS THESE BUTTONS.
// DO NOT RECREATE THEM.
// ============================================================

function setupExperienceChips() {

  els.experienceChips.forEach(
    chip => {

      chip.addEventListener(
        "click",
        () => {

          const value =
            chip.dataset.value;

          if (!value) return;


          chip.classList.toggle(
            "selected"
          );


          if (
            chip.classList.contains(
              "selected"
            )
          ) {

            if (
              !state.experiences.includes(
                value
              )
            ) {

              state.experiences.push(
                value
              );

            }

          } else {

            state.experiences =
              state.experiences.filter(
                item =>
                  item !== value
              );

          }

        }
      );

    }
  );

}


// ============================================================
// ITEM CHIP
// ============================================================

function toggleItemChip(button) {

  const value =
    button.dataset.value;


  if (!value) return;


  button.classList.toggle(
    "selected"
  );


  if (
    button.classList.contains(
      "selected"
    )
  ) {

    if (
      !state.items.includes(value)
    ) {

      state.items.push(value);

    }

  } else {

    state.items =
      state.items.filter(
        item =>
          item !== value
      );

  }

}


// ============================================================
// SYNC STATE
// ============================================================

function syncState() {

  if (els.note) {

    state.note =
      els.note.value.trim();

  }


  // Re-read experience chips
  state.experiences =
    els.experienceChips
      .filter(chip =>
        chip.classList.contains(
          "selected"
        )
      )
      .map(chip =>
        chip.dataset.value
      )
      .filter(Boolean);


  // Re-read item chips
  if (els.itemChips) {

    state.items =
      [
        ...els.itemChips.querySelectorAll(
          ".chip.selected"
        )
      ]
      .map(chip =>
        chip.dataset.value
      )
      .filter(Boolean);

  }

}


// ============================================================
// RATING
// ============================================================

function setRating(rating) {

  state.rating =
    Number(rating) || 0;


  els.stars.forEach(
    (star, index) => {

      const value =
        index + 1;


      star.classList.toggle(
        "active",
        value <= state.rating
      );

    }
  );


  const labels = {

    0: "Tap a star to rate",

    1: "Very poor",

    2: "Needs improvement",

    3: "Good",

    4: "Very good",

    5: "Excellent"

  };


  if (els.ratingLabel) {

    els.ratingLabel.textContent =
      labels[state.rating] ||
      "Tap a star to rate";

  }

}


// ============================================================
// GEMINI AI
// ============================================================

function generateAIReview() {

  return new Promise(
    (resolve, reject) => {

      const config =
        getConfig();


      const endpoint =
        config.sheetsWebAppUrl;


      if (!endpoint) {

        reject(
          new Error(
            "Apps Script Web App URL is missing."
          )
        );

        return;

      }


      const callbackName =
        "geminiCallback_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .substring(2);


      const script =
        document.createElement(
          "script"
        );


      let finished = false;


      const cleanup = () => {

        if (
          script.parentNode
        ) {

          script.parentNode.removeChild(
            script
          );

        }


        try {

          delete window[
            callbackName
          ];

        } catch (error) {

          window[
            callbackName
          ] = undefined;

        }

      };


      const timeout =
        setTimeout(
          () => {

            if (finished) return;

            finished = true;

            cleanup();


            reject(
              new Error(
                "Gemini request timed out."
              )
            );

          },
          30000
        );


      window[callbackName] =
        function(result) {

          if (finished) return;

          finished = true;

          clearTimeout(timeout);

          cleanup();


          if (
            result &&
            result.ok &&
            result.review
          ) {

            resolve(
              String(
                result.review
              ).trim()
            );

          } else {

            reject(
              new Error(
                result &&
                result.error
                  ? result.error
                  : "Gemini did not return a review."
              )
            );

          }

        };


      const params =
        new URLSearchParams();


      params.set(
        "action",
        "generate_review"
      );


      params.set(
        "callback",
        callbackName
      );


      params.set(
        "cafe",
        config.name || "Cafe"
      );


      params.set(
        "rating",
        String(
          state.rating
        )
      );


      params.set(
        "experiences",
        JSON.stringify(
          state.experiences
        )
      );


      params.set(
        "items",
        JSON.stringify(
          state.items
        )
      );


      params.set(
        "note",
        state.note
      );


      script.src =
        endpoint +
        (
          endpoint.includes("?")
            ? "&"
            : "?"
        ) +
        params.toString();


      script.onerror =
        function() {

          if (finished) return;

          finished = true;

          clearTimeout(timeout);

          cleanup();


          reject(
            new Error(
              "Could not connect to Apps Script."
            )
          );

        };


      document.body.appendChild(
        script
      );

    }
  );

}


// ============================================================
// SHOW REVIEW
// ============================================================

function showGeneratedReview(
  review
) {

  if (!review) return;


  state.generated = true;

  state.version++;


  if (els.reviewText) {

    els.reviewText.textContent =
      review;

  }


  if (els.preview) {

    els.preview.classList.add(
      "show"
    );

  }


  if (els.editButton) {

    els.editButton.style.display =
      "";

  }


  if (els.regenerateButton) {

    els.regenerateButton.style.display =
      "";

  }


  if (els.googleButton) {

    els.googleButton.style.display =
      "";

  }


  if (els.preview) {

    setTimeout(
      () => {

        els.preview.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      },
      100
    );

  }

}


// ============================================================
// GENERATE REVIEW
// ============================================================

async function generateReview() {

  syncState();


  if (!state.rating) {

    alert(
      "Please select your rating first."
    );

    return;

  }


  if (els.generateButton) {

    els.generateButton.disabled =
      true;

    const label =
      els.generateButton.querySelector(
        "span:nth-child(2)"
      );

    if (label) {

      label.textContent =
        "Creating your review...";

    }

  }


  try {

    const review =
      await generateAIReview();


    showGeneratedReview(
      review
    );


    logEvent({

      event:
        "review_generated",

      rating:
        state.rating,

      experiences:
        state.experiences,

      items:
        state.items,

      review:
        review

    });

  } catch (error) {

    console.error(
      "Gemini error:",
      error
    );


    alert(
      "AI Review Error:\n\n" +
      error.message +
      "\n\nPlease check Apps Script deployment and Gemini API key."
    );

  } finally {

    if (els.generateButton) {

      els.generateButton.disabled =
        false;


      const label =
        els.generateButton.querySelector(
          "span:nth-child(2)"
        );


      if (label) {

        label.textContent =
          "Create My Review";

      }

    }

  }

}


// ============================================================
// REGENERATE
// ============================================================

async function regenerateReview() {

  syncState();


  if (!state.rating) {

    alert(
      "Please select your rating first."
    );

    return;

  }


  if (els.regenerateButton) {

    els.regenerateButton.disabled =
      true;

    els.regenerateButton.textContent =
      "Regenerating...";

  }


  try {

    const review =
      await generateAIReview();


    showGeneratedReview(
      review
    );


    logEvent({

      event:
        "review_regenerated",

      rating:
        state.rating,

      experiences:
        state.experiences,

      items:
        state.items,

      review:
        review

    });

  } catch (error) {

    console.error(
      "Gemini regenerate error:",
      error
    );


    alert(
      "AI Regeneration Error:\n\n" +
      error.message
    );

  } finally {

    if (
      els.regenerateButton
    ) {

      els.regenerateButton.disabled =
        false;

      els.regenerateButton.textContent =
        "↻ Regenerate";

    }

  }

}


// ============================================================
// EDIT REVIEW
// ============================================================

function enableEditing() {

  if (!els.reviewText) return;


  els.reviewText.contentEditable =
    "true";


  els.reviewText.classList.add(
    "editing"
  );


  els.reviewText.focus();


  if (els.editButton) {

    els.editButton.textContent =
      "Save Review";

  }

}


function saveEditing() {

  if (!els.reviewText) return;


  els.reviewText.contentEditable =
    "false";


  els.reviewText.classList.remove(
    "editing"
  );


  const review =
    els.reviewText.textContent.trim();


  if (!review) {

    alert(
      "Review cannot be empty."
    );

    return;

  }


  if (els.editButton) {

    els.editButton.textContent =
      "✎ Edit";

  }


  logEvent({

    event:
      "review_edited",

    rating:
      state.rating,

    experiences:
      state.experiences,

    items:
      state.items,

    review:
      review

  });

}


// ============================================================
// GOOGLE
// ============================================================

async function continueToGoogle() {

  const config =
    window.CAFE_CONFIG || {};

  const review =
    els.reviewText
      ? els.reviewText.textContent.trim()
      : "";

  if (!review) {
    alert("Please create a review first.");
    return;
  }

  const googleUrl =
    config.googleReviewUrl;

  if (!googleUrl) {
    alert("Google review link is not configured.");
    return;
  }

  // Copy review
  try {

    await navigator.clipboard.writeText(review);

  } catch (error) {

    console.warn(
      "Clipboard failed:",
      error
    );

  }

  // Log click
  logEvent({
    event: "google_click",
    rating: state.rating,
    experiences: state.experiences,
    items: state.items,
    review: review
  });

  // Open Google in SAME TAB
  window.location.href = googleUrl;
}
// ============================================================
// GOOGLE SHEETS LOGGING
// ============================================================

function logEvent(
  extraData = {}
) {

  const config =
    getConfig();


  const endpoint =
    config.sheetsWebAppUrl;


  if (!endpoint) return;


  const payload = {

    timestamp:
      new Date().toISOString(),

    scanId:
      state.scanId,

    cafe:
      config.name || "",

    rating:
      state.rating || "",

    experiences:
      state.experiences || [],

    items:
      state.items || [],

    review:
      els.reviewText
        ? els.reviewText.textContent.trim()
        : "",

    ...extraData

  };


  fetch(
    endpoint,
    {

      method: "POST",

      mode: "no-cors",

      headers: {
        "Content-Type":
          "text/plain;charset=utf-8"
      },

      body:
        JSON.stringify(payload),

      keepalive: true

    }
  ).catch(
    error => {

      console.warn(
        "Sheets logging failed:",
        error
      );

    }
  );

}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEvents() {

  // ----------------------------------------------------------
  // STARS
  // ----------------------------------------------------------

  els.stars.forEach(
    star => {

      star.addEventListener(
        "click",
        () => {

          setRating(
            Number(
              star.dataset.rating
            )
          );

        }
      );

    }
  );


  // ----------------------------------------------------------
  // NOTE
  // ----------------------------------------------------------

  if (els.note) {

    els.note.addEventListener(
      "input",
      () => {

        state.note =
          els.note.value.trim();


        if (els.charCount) {

          els.charCount.textContent =
            els.note.value.length;

        }

      }
    );

  }


  // ----------------------------------------------------------
  // GENERATE
  // ----------------------------------------------------------

  if (els.generateButton) {

    els.generateButton.addEventListener(
      "click",
      generateReview
    );

  }


  // ----------------------------------------------------------
  // REGENERATE
  // ----------------------------------------------------------

  if (els.regenerateButton) {

    els.regenerateButton.addEventListener(
      "click",
      regenerateReview
    );

  }


  // ----------------------------------------------------------
  // EDIT
  // ----------------------------------------------------------

  if (els.editButton) {

    els.editButton.addEventListener(
      "click",
      () => {

        if (
          els.reviewText &&
          els.reviewText.contentEditable ===
            "true"
        ) {

          saveEditing();

        } else {

          enableEditing();

        }

      }
    );

  }


  // ----------------------------------------------------------
  // GOOGLE
  // ----------------------------------------------------------

  if (els.googleButton) {

    els.googleButton.addEventListener(
      "click",
      continueToGoogle
    );

  }


  // ----------------------------------------------------------
  // ABOUT BUTTON
  // ----------------------------------------------------------

  const aboutButton =
    document.querySelector(
      ".icon-button"
    );


  if (aboutButton) {

    aboutButton.addEventListener(
      "click",
      () => {

        const config =
          getConfig();


        alert(
          `${config.name || "Cafe"}\n\n` +
          `${config.location || ""}\n\n` +
          "Thank you for sharing your experience."
        );

      }
    );

  }

}


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    applyCafeConfig();

    setupExperienceChips();

    setupEvents();

    setRating(0);


    // Initial scan
    logEvent({

      event: "scan"

    });

  }
);
