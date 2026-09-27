// ============================================================
// CAFE REVIEW SYSTEM - GEMINI AI VERSION
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
  location: document.getElementById("location"),
  brandMark: document.getElementById("brandMark"),
  footer: document.getElementById("footer"),
  socialTitle: document.getElementById("socialTitle"),

  stars: [...document.querySelectorAll(".star")],
  ratingLabel: document.getElementById("ratingLabel"),

  experienceChips: document.getElementById("experienceChips"),
  itemChips: document.getElementById("itemChips"),

  note: document.getElementById("note"),
  charCount: document.getElementById("charCount"),

  generateButton: document.getElementById("generateButton"),

  preview: document.getElementById("preview"),
  reviewText: document.getElementById("reviewText"),

  editButton: document.getElementById("editButton"),
  regenerateButton: document.getElementById("regenerateButton"),
  googleButton: document.getElementById("googleButton"),

  socialButtons: document.getElementById("socialButtons")
};

// ============================================================
// FALLBACK REVIEW DATA
// Used only if Gemini API is unavailable.
// ============================================================

const ratingTemplates = {
  5: [
    "I had a really good experience at {cafe}.",
    "Really enjoyed my experience at {cafe}.",
    "Had a wonderful time at {cafe}.",
    "Great experience overall at {cafe}."
  ],

  4: [
    "I had a very good experience at {cafe}.",
    "Overall, I had a really good experience at {cafe}.",
    "I enjoyed my visit to {cafe}.",
    "Had a nice experience at {cafe}."
  ],

  3: [
    "Overall, I had a decent experience at {cafe}.",
    "My experience at {cafe} was good overall.",
    "It was a fairly good experience at {cafe}.",
    "I had an okay experience at {cafe}."
  ],

  2: [
    "My experience at {cafe} was average.",
    "The overall experience at {cafe} could have been better.",
    "I had a mixed experience at {cafe}.",
    "There were some things that could be improved at {cafe}."
  ],

  1: [
    "My experience at {cafe} was disappointing.",
    "Unfortunately, my experience at {cafe} was not very good.",
    "I was not very satisfied with my experience at {cafe}.",
    "There are a few things that could be improved at {cafe}."
  ]
};

const experiencePhrases = {
  food: {
    5: "The food was really enjoyable.",
    4: "The food was quite good.",
    3: "The food was decent.",
    2: "The food could have been better.",
    1: "The food did not meet my expectations."
  },

  drinks: {
    5: "The drinks were refreshing and enjoyable.",
    4: "The drinks were quite good.",
    3: "The drinks were decent.",
    2: "The drinks could have been better.",
    1: "The drinks were not quite what I expected."
  },

  ambience: {
    5: "The ambience was comfortable and pleasant.",
    4: "The ambience was nice and comfortable.",
    3: "The ambience was decent.",
    2: "The ambience could use some improvement.",
    1: "The ambience was not really to my liking."
  },

  service: {
    5: "The service was smooth and friendly.",
    4: "The service was good.",
    3: "The service was okay.",
    2: "The service could have been better.",
    1: "The service was not as good as expected."
  },

  staff: {
    5: "The staff were friendly and helpful.",
    4: "The staff were polite and helpful.",
    3: "The staff were okay.",
    2: "The staff could have been more attentive.",
    1: "The staff experience could have been better."
  },

  value: {
    5: "The overall value felt great.",
    4: "The overall value was good.",
    3: "The value was reasonable.",
    2: "The value could have been better.",
    1: "I felt the overall value could be improved."
  }
};

const closings = {
  5: [
    "Would definitely consider coming back.",
    "I would happily visit again.",
    "Overall, a lovely experience.",
    "Would recommend giving it a try."
  ],

  4: [
    "I would definitely consider visiting again.",
    "Overall, a good experience.",
    "Would be happy to visit again.",
    "Worth trying if you're around."
  ],

  3: [
    "Overall, it was an okay experience.",
    "There is room for improvement, but it was decent.",
    "I may visit again sometime.",
    "Overall, a fairly decent experience."
  ],

  2: [
    "Hopefully, the experience improves in the future.",
    "There is definitely some room for improvement.",
    "I hope the experience gets better with time.",
    "Some improvements would make the experience better."
  ],

  1: [
    "I hope the experience improves in the future.",
    "There is quite a bit of room for improvement.",
    "Hopefully, the issues are addressed in the future.",
    "I hope things improve for future visits."
  ]
};

// ============================================================
// HELPERS
// ============================================================

function createScanId() {
  return (
    "SCAN-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

function escapeText(value) {
  return String(value || "").trim();
}

function randomItem(array) {
  if (!array || !array.length) return "";
  return array[Math.floor(Math.random() * array.length)];
}

// ============================================================
// CONFIG
// ============================================================

function applyCafeConfig() {
  const config = window.CAFE_CONFIG || {};

  if (els.cafeName) {
    els.cafeName.textContent = config.name || "Cafe";
  }

  if (els.location) {
    els.location.textContent =
      config.location || "";
  }

  if (els.footer) {
    els.footer.textContent =
      config.name || "Cafe";
  }

  if (els.socialTitle) {
    els.socialTitle.textContent =
      `Follow ${config.name || "us"}`;
  }

  if (els.brandMark && config.logo) {
    els.brandMark.src = config.logo;
    els.brandMark.style.display = "block";
  }

  // ----------------------------------------------------------
  // MENU ITEMS
  // ----------------------------------------------------------

  if (els.itemChips) {
    els.itemChips.innerHTML = "";

    const menuItems = Array.isArray(config.menuItems)
      ? config.menuItems
      : [];

    menuItems.forEach(item => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "chip item-chip";

      button.innerHTML = `
        <span>${item.icon || "☕"}</span>
        <span>${item.name || ""}</span>
      `;

      button.addEventListener("click", () => {
        button.classList.toggle("active");

        const name = item.name || "";

        if (state.items.includes(name)) {
          state.items = state.items.filter(
            value => value !== name
          );
        } else {
          state.items.push(name);
        }

        syncState();
      });

      els.itemChips.appendChild(button);
    });
  }

  // ----------------------------------------------------------
  // SOCIAL LINKS
  // ----------------------------------------------------------

  if (els.socialButtons) {
    const social = config.social || {};

    els.socialButtons.innerHTML = "";

    Object.entries(social).forEach(([platform, url]) => {
      if (!url) return;

      const button = document.createElement("a");

      button.href = url;
      button.target = "_blank";
      button.rel = "noopener noreferrer";
      button.className = "social-button";

      button.textContent =
        platform.charAt(0).toUpperCase() +
        platform.slice(1);

      button.addEventListener("click", () => {
        logEvent({
          event: "social_click",
          platform: platform
        });
      });

      els.socialButtons.appendChild(button);
    });
  }
}

// ============================================================
// STATE
// ============================================================

function syncState() {
  state.note = escapeText(
    els.note ? els.note.value : ""
  );
}

// ============================================================
// RATING
// ============================================================

function setRating(rating) {
  state.rating = Number(rating) || 0;

  els.stars.forEach((star, index) => {
    const value = index + 1;

    star.classList.toggle(
      "active",
      value <= state.rating
    );

    star.setAttribute(
      "aria-checked",
      value === state.rating ? "true" : "false"
    );
  });

  if (els.ratingLabel) {
    const labels = {
      0: "Select your rating",
      1: "Very poor",
      2: "Needs improvement",
      3: "Good",
      4: "Very good",
      5: "Excellent"
    };

    els.ratingLabel.textContent =
      labels[state.rating] || "Select your rating";
  }
}

// ============================================================
// FALLBACK LOCAL REVIEW GENERATOR
// ============================================================

function buildReview() {
  const config = window.CAFE_CONFIG || {};

  const cafe =
    config.name || "the cafe";

  const rating =
    state.rating || 5;

  const baseTemplate =
    randomItem(
      ratingTemplates[rating] ||
      ratingTemplates[5]
    );

  let review =
    baseTemplate.replace(
      "{cafe}",
      cafe
    );

  const selectedExperiences =
    state.experiences || [];

  selectedExperiences.forEach(key => {
    if (
      experiencePhrases[key] &&
      experiencePhrases[key][rating]
    ) {
      review +=
        " " +
        experiencePhrases[key][rating];
    }
  });

  if (state.items.length) {
    review +=
      ` I also tried ${state.items.join(", ")}.`;
  }

  if (state.note) {
    review +=
      ` ${state.note}`;
  }

  review +=
    " " +
    randomItem(
      closings[rating] ||
      closings[5]
    );

  return review.trim();
}

// ============================================================
// DISPLAY GENERATED REVIEW
// ============================================================

function showGeneratedReview(review) {
  if (!review) return;

  state.generated = true;
  state.version += 1;

  if (els.reviewText) {
    els.reviewText.textContent = review;
  }

  if (els.preview) {
    els.preview.classList.add("show");
  }

  if (els.editButton) {
    els.editButton.style.display = "";
  }

  if (els.regenerateButton) {
    els.regenerateButton.style.display = "";
  }

  if (els.googleButton) {
    els.googleButton.style.display = "";
  }
}

// ============================================================
// GEMINI AI REVIEW GENERATOR
// ============================================================

function generateAIReview() {
  return new Promise((resolve, reject) => {

    const config = window.CAFE_CONFIG || {};

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
      "geminiReviewCallback_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2);

    let finished = false;

    const script =
      document.createElement("script");

    const cleanup = () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = undefined;
      }
    };

    const timeout = setTimeout(() => {
      if (finished) return;

      finished = true;
      cleanup();

      reject(
        new Error(
          "Gemini request timed out."
        )
      );
    }, 30000);

    window[callbackName] = function(result) {
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
          String(result.review).trim()
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

    const params = new URLSearchParams();

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
      String(state.rating || 0)
    );

    params.set(
      "experiences",
      JSON.stringify(
        state.experiences || []
      )
    );

    params.set(
      "items",
      JSON.stringify(
        state.items || []
      )
    );

    params.set(
      "note",
      state.note || ""
    );

    script.src =
      endpoint +
      (endpoint.includes("?") ? "&" : "?") +
      params.toString();

    script.onerror = () => {
      if (finished) return;

      finished = true;
      clearTimeout(timeout);
      cleanup();

      reject(
        new Error(
          "Could not connect to the AI service."
        )
      );
    };

    document.body.appendChild(script);
  });
}

// ============================================================
// CREATE REVIEW
// ============================================================

async function generateReview() {

  syncState();

  if (!state.rating) {
    alert(
      "Please select your rating first."
    );
    return;
  }

  if (
    els.generateButton
  ) {
    els.generateButton.disabled = true;
    els.generateButton.textContent =
      "Creating your review...";
  }

  try {

    const review =
      await generateAIReview();

    showGeneratedReview(review);

    logEvent({
      event: "review_generated",
      rating: state.rating,
      experiences: state.experiences,
      items: state.items,
      review: review
    });

  } catch (error) {

    console.error(
      "Gemini error:",
      error
    );

    // --------------------------------------------------------
    // FALLBACK
    // --------------------------------------------------------

    const fallback =
      buildReview();

    showGeneratedReview(fallback);

    logEvent({
      event: "review_generated_fallback",
      rating: state.rating,
      experiences: state.experiences,
      items: state.items,
      review: fallback,
      error: String(error)
    });

  } finally {

    if (els.generateButton) {
      els.generateButton.disabled = false;
      els.generateButton.textContent =
        "Create My Review";
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

  if (
    els.regenerateButton
  ) {
    els.regenerateButton.disabled = true;
    els.regenerateButton.textContent =
      "Regenerating...";
  }

  try {

    const review =
      await generateAIReview();

    showGeneratedReview(review);

    logEvent({
      event: "review_regenerated",
      rating: state.rating,
      experiences: state.experiences,
      items: state.items,
      review: review
    });

  } catch (error) {

    console.error(
      "Gemini regenerate error:",
      error
    );

    const fallback =
      buildReview();

    showGeneratedReview(fallback);

    logEvent({
      event: "review_regenerated_fallback",
      rating: state.rating,
      experiences: state.experiences,
      items: state.items,
      review: fallback,
      error: String(error)
    });

  } finally {

    if (
      els.regenerateButton
    ) {
      els.regenerateButton.disabled = false;
      els.regenerateButton.textContent =
        "Regenerate";
    }
  }
}

// ============================================================
// EDIT REVIEW
// ============================================================

function enableEditing() {

  if (!els.reviewText) return;

  els.reviewText.contentEditable = "true";

  els.reviewText.focus();

  els.reviewText.classList.add(
    "editing"
  );

  if (els.editButton) {
    els.editButton.textContent =
      "Save Review";
  }
}

function saveEditing() {

  if (!els.reviewText) return;

  els.reviewText.contentEditable = "false";

  els.reviewText.classList.remove(
    "editing"
  );

  const editedReview =
    els.reviewText.textContent.trim();

  if (!editedReview) {

    const fallback =
      buildReview();

    els.reviewText.textContent =
      fallback;
  }

  if (els.editButton) {
    els.editButton.textContent =
      "Edit Review";
  }

  logEvent({
    event: "review_edited",
    rating: state.rating,
    experiences: state.experiences,
    items: state.items,
    review:
      els.reviewText.textContent.trim()
  });
}

// ============================================================
// COPY + OPEN GOOGLE
// ============================================================

async function continueToGoogle() {

  const config =
    window.CAFE_CONFIG || {};

  const review =
    els.reviewText
      ? els.reviewText.textContent.trim()
      : "";

  if (!review) {
    alert(
      "Please create a review first."
    );
    return;
  }

  const googleUrl =
    config.googleReviewUrl;

  if (!googleUrl) {
    alert(
      "Google review link is not configured."
    );
    return;
  }

  // ----------------------------------------------------------
  // COPY REVIEW
  // ----------------------------------------------------------

  try {

    await navigator.clipboard.writeText(
      review
    );

    alert(
      "Review copied! Google Reviews will open now. Paste your review and submit it."
    );

  } catch (error) {

    console.warn(
      "Clipboard failed:",
      error
    );

    alert(
      "Google Reviews will open now. Please copy your review manually."
    );
  }

  // ----------------------------------------------------------
  // LOG GOOGLE CLICK
  // ----------------------------------------------------------

  logEvent({
    event: "google_click",
    rating: state.rating,
    experiences: state.experiences,
    items: state.items,
    review: review
  });

  // ----------------------------------------------------------
  // OPEN GOOGLE
  // ----------------------------------------------------------

  window.open(
    googleUrl,
    "_blank",
    "noopener,noreferrer"
  );
}

// ============================================================
// GOOGLE SHEETS EVENT LOGGER
// ============================================================

function logEvent(extraData = {}) {

  const config =
    window.CAFE_CONFIG || {};

  const endpoint =
    config.sheetsWebAppUrl;

  if (!endpoint) {
    return;
  }

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

  try {

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
          JSON.stringify(payload)
      }
    );

  } catch (error) {

    console.warn(
      "Event logging failed:",
      error
    );
  }
}

// ============================================================
// EXPERIENCE CHIPS
// ============================================================

function setupExperienceChips() {

  if (!els.experienceChips) {
    return;
  }

  const experiences = [
    {
      key: "food",
      label: "Food"
    },
    {
      key: "drinks",
      label: "Drinks"
    },
    {
      key: "ambience",
      label: "Ambience"
    },
    {
      key: "service",
      label: "Service"
    },
    {
      key: "staff",
      label: "Staff"
    },
    {
      key: "value",
      label: "Value"
    }
  ];

  els.experienceChips.innerHTML = "";

  experiences.forEach(item => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "chip experience-chip";

    button.textContent =
      item.label;

    button.addEventListener(
      "click",
      () => {

        button.classList.toggle(
          "active"
        );

        if (
          state.experiences.includes(
            item.key
          )
        ) {

          state.experiences =
            state.experiences.filter(
              value =>
                value !== item.key
            );

        } else {

          state.experiences.push(
            item.key
          );
        }

        syncState();
      }
    );

    els.experienceChips.appendChild(
      button
    );
  });
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEvents() {

  // ----------------------------------------------------------
  // STARS
  // ----------------------------------------------------------

  els.stars.forEach(
    (star, index) => {

      star.addEventListener(
        "click",
        () => {
          setRating(index + 1);
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

        syncState();

        if (els.charCount) {

          els.charCount.textContent =
            `${els.note.value.length}`;
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
  // EDIT
  // ----------------------------------------------------------

  if (els.editButton) {

    els.editButton.addEventListener(
      "click",
      () => {

        const editing =
          els.reviewText &&
          els.reviewText.contentEditable ===
            "true";

        if (editing) {
          saveEditing();
        } else {
          enableEditing();
        }
      }
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
  // GOOGLE
  // ----------------------------------------------------------

  if (els.googleButton) {

    els.googleButton.addEventListener(
      "click",
      continueToGoogle
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

    logEvent({
      event: "scan"
    });

  }
);
