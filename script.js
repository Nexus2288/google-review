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

  // IMPORTANT:
  // Existing HTML chips are used directly.
  experienceChips: [
    ...document.querySelectorAll("#experienceChips .chip")
  ],

  itemChips: document.getElementById("itemChips"),

  note: document.getElementById("note"),
  charCount: document.getElementById("charCount"),

  generateButton: document.getElementById("generateButton"),

  preview:
    document.getElementById("reviewPreview") ||
    document.getElementById("preview"),

  reviewText: document.getElementById("reviewText"),

  editButton: document.getElementById("editButton"),
  regenerateButton: document.getElementById("regenerateButton"),
  googleButton: document.getElementById("googleButton"),

  socialButtons: [
    ...document.querySelectorAll("[data-social]")
  ]
};

// ============================================================
// RATING LABELS
// ============================================================

const ratingLabels = {
  0: "Tap a star to rate",
  1: "Not great",
  2: "Could be better",
  3: "Good",
  4: "Really good",
  5: "Loved it!"
};

// ============================================================
// FALLBACK REVIEW
// Used only if Gemini is unavailable
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
  return array[
    Math.floor(Math.random() * array.length)
  ];
}

// ============================================================
// CAFE CONFIG
// ============================================================

function applyCafeConfig() {

  const config =
    window.CAFE_CONFIG || {};

  if (els.cafeName) {
    els.cafeName.textContent =
      config.name || "Cafe";
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

  // ----------------------------------------------------------
  // LOGO
  // ----------------------------------------------------------

  if (
    els.brandMark &&
    config.logo
  ) {
    if (
      els.brandMark.tagName === "IMG"
    ) {
      els.brandMark.src =
        config.logo;
    }
  }

  // ----------------------------------------------------------
  // MENU ITEMS
  // ----------------------------------------------------------

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
        "chip";

      button.dataset.value =
        item.name || "";

      button.innerHTML = `
        <span>${item.icon || "•"}</span>
        <span>${item.name || ""}</span>
      `;

      button.addEventListener(
        "click",
        () => toggleChip(button)
      );

      els.itemChips.appendChild(
        button
      );
    });
  }

  // ----------------------------------------------------------
  // SOCIAL
  // ----------------------------------------------------------

  const social =
    config.social || {};

  els.socialButtons.forEach(button => {

    const platform =
      button.dataset.social;

    const url =
      social[platform] || "#";

    button.href = url;

    if (url === "#") {

      button.addEventListener(
        "click",
        event =>
          event.preventDefault()
      );

    } else {

      button.addEventListener(
        "click",
        () => {

          logEvent({
            event: "social_click",
            platform: platform
          });

        }
      );
    }
  });
}

// ============================================================
// GET SELECTED CHIPS
// ============================================================

function getSelected(chips) {

  return chips
    .filter(chip =>
      chip.classList.contains("selected")
    )
    .map(chip =>
      chip.dataset.value ||
      chip.textContent.trim().toLowerCase()
    );
}

// ============================================================
// SYNC STATE
// ============================================================

function syncState() {

  state.experiences =
    getSelected(
      els.experienceChips
    );

  const itemElements =
    els.itemChips
      ? [
          ...els.itemChips.querySelectorAll(
            ".chip"
          )
        ]
      : [];

  state.items =
    getSelected(itemElements);

  state.note =
    escapeText(
      els.note
        ? els.note.value
        : ""
    );
}

// ============================================================
// RATING
// ============================================================

function setRating(value) {

  state.rating =
    Number(value) || 0;

  els.stars.forEach(star => {

    const rating =
      Number(
        star.dataset.rating
      );

    star.classList.toggle(
      "active",
      rating <= state.rating
    );
  });

  if (els.ratingLabel) {

    els.ratingLabel.textContent =
      ratingLabels[state.rating] ||
      "Tap a star to rate";
  }
}

// ============================================================
// CHIP TOGGLE
// ============================================================

function toggleChip(chip) {

  if (!chip) return;

  chip.classList.toggle(
    "selected"
  );

  // Some old CSS may use active.
  // Keep both classes synchronized.
  chip.classList.toggle(
    "active",
    chip.classList.contains(
      "selected"
    )
  );

  syncState();
}

// ============================================================
// FALLBACK REVIEW
// ============================================================

function buildReview() {

  syncState();

  const config =
    window.CAFE_CONFIG || {};

  const cafe =
    config.name || "the cafe";

  const rating =
    state.rating || 5;

  let review =
    randomItem(
      ratingTemplates[rating] ||
      ratingTemplates[5]
    ).replace(
      "{cafe}",
      cafe
    );

  // Selected experiences

  state.experiences.forEach(
    experience => {

      if (
        experiencePhrases[
          experience
        ] &&
        experiencePhrases[
          experience
        ][rating]
      ) {

        review +=
          " " +
          experiencePhrases[
            experience
          ][rating];
      }
    }
  );

  // Selected items

  if (
    state.items.length
  ) {

    review +=
      ` I also tried ${state.items.join(
        ", "
      )}.`;
  }

  // Customer note

  if (state.note) {

    review +=
      ` ${state.note}`;
  }

  // Closing

  review +=
    " " +
    randomItem(
      closings[rating] ||
      closings[5]
    );

  return review.trim();
}

// ============================================================
// SHOW REVIEW
// ============================================================

function showGeneratedReview(
  review
) {

  if (!review) return;

  state.generated =
    true;

  state.version += 1;

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
}

// ============================================================
// GEMINI AI
// ============================================================

function generateAIReview() {

  return new Promise(
    (resolve, reject) => {

      const config =
        window.CAFE_CONFIG || {};

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
          .slice(2);

      const script =
        document.createElement(
          "script"
        );

      let finished =
        false;

      function cleanup() {

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
      }

      const timeout =
        setTimeout(
          () => {

            if (finished)
              return;

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

      window[
        callbackName
      ] = function(result) {

        if (finished)
          return;

        finished = true;

        clearTimeout(
          timeout
        );

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
        config.name ||
        "Cafe"
      );

      params.set(
        "rating",
        String(
          state.rating || 0
        )
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
        (
          endpoint.includes("?")
            ? "&"
            : "?"
        ) +
        params.toString();

      script.onerror =
        () => {

          if (finished)
            return;

          finished = true;

          clearTimeout(
            timeout
          );

          cleanup();

          reject(
            new Error(
              "Could not connect to the AI service."
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
// CREATE REVIEW
// ============================================================

async function generateReview() {

  syncState();

  if (!state.rating) {

    if (els.ratingLabel) {

      els.ratingLabel.textContent =
        "Please choose a rating first.";
    }

    return;
  }

  if (els.generateButton) {

    els.generateButton.disabled =
      true;

    els.generateButton.classList.add(
      "loading"
    );

    const label =
      els.generateButton.querySelector(
        "span:nth-child(2)"
      );

    if (label) {

      label.textContent =
        "Creating your review...";
    } else {

      els.generateButton.textContent =
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

    // Gemini failed → local fallback

    const fallback =
      buildReview();

    showGeneratedReview(
      fallback
    );

    logEvent({
      event:
        "review_generated_fallback",

      rating:
        state.rating,

      experiences:
        state.experiences,

      items:
        state.items,

      review:
        fallback,

      error:
        String(error)
    });

  } finally {

    if (
      els.generateButton
    ) {

      els.generateButton.disabled =
        false;

      els.generateButton.classList.remove(
        "loading"
      );

      const label =
        els.generateButton.querySelector(
          "span:nth-child(2)"
        );

      if (label) {

        label.textContent =
          "Create My Review";

      } else {

        els.generateButton.textContent =
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

    if (els.ratingLabel) {

      els.ratingLabel.textContent =
        "Please choose a rating first.";
    }

    return;
  }

  if (
    els.regenerateButton
  ) {

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

    const fallback =
      buildReview();

    showGeneratedReview(
      fallback
    );

    logEvent({
      event:
        "review_regenerated_fallback",

      rating:
        state.rating,

      experiences:
        state.experiences,

      items:
        state.items,

      review:
        fallback,

      error:
        String(error)
    });

  } finally {

    if (
      els.regenerateButton
    ) {

      els.regenerateButton.disabled =
        false;

      els.regenerateButton.textContent =
        "Regenerate";
    }
  }
}

// ============================================================
// EDIT REVIEW
// ============================================================

function enableEditing() {

  if (!els.reviewText)
    return;

  els.reviewText.contentEditable =
    "true";

  els.reviewText.classList.add(
    "editing"
  );

  els.reviewText.focus();

  if (els.editButton) {

    els.editButton.textContent =
      "Save Review";

    els.editButton.dataset.editing =
      "true";
  }
}

function saveEditing() {

  if (!els.reviewText)
    return;

  els.reviewText.contentEditable =
    "false";

  els.reviewText.classList.remove(
    "editing"
  );

  let review =
    els.reviewText.textContent.trim();

  if (!review) {

    review =
      buildReview();

    els.reviewText.textContent =
      review;
  }

  if (els.editButton) {

    els.editButton.textContent =
      "Edit Review";

    els.editButton.dataset.editing =
      "false";
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
// COPY REVIEW + OPEN GOOGLE
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

  try {

    await navigator.clipboard.writeText(
      review
    );

    alert(
      "Review copied! Google will open now. Paste your review and submit it."
    );

  } catch (error) {

    console.warn(
      "Clipboard failed:",
      error
    );

    alert(
      "Google will open now. Please copy your review manually."
    );
  }

  logEvent({
    event:
      "google_click",

    rating:
      state.rating,

    experiences:
      state.experiences,

    items:
      state.items,

    review:
      review
  });

  window.open(
    googleUrl,
    "_blank",
    "noopener,noreferrer"
  );
}

// ============================================================
// GOOGLE SHEETS LOGGER
// ============================================================

function logEvent(
  extraData = {}
) {

  const config =
    window.CAFE_CONFIG || {};

  const endpoint =
    config.sheetsWebAppUrl;

  if (!endpoint)
    return;

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
          JSON.stringify(
            payload
          ),

        keepalive: true
      }
    ).catch(
      error =>
        console.warn(
          "Logging error:",
          error
        )
    );

  } catch (error) {

    console.warn(
      "Event logging failed:",
      error
    );
  }
}

// ============================================================
// SETUP EXISTING EXPERIENCE CHIPS
// ============================================================

function setupExperienceChips() {

  // IMPORTANT:
  // Do NOT create new buttons here.
  // The buttons already exist in index.html.

  els.experienceChips.forEach(
    chip => {

      chip.addEventListener(
        "click",
        () => {

          toggleChip(chip);

        }
      );

    }
  );
}

// ============================================================
// EVENT SETUP
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

        syncState();

        if (
          els.charCount
        ) {

          els.charCount.textContent =
            els.note.value.length;
        }

      }
    );
  }

  // ----------------------------------------------------------
  // GENERATE
  // ----------------------------------------------------------

  if (
    els.generateButton
  ) {

    els.generateButton.addEventListener(
      "click",
      generateReview
    );
  }

  // ----------------------------------------------------------
  // REGENERATE
  // ----------------------------------------------------------

  if (
    els.regenerateButton
  ) {

    els.regenerateButton.addEventListener(
      "click",
      regenerateReview
    );
  }

  // ----------------------------------------------------------
  // EDIT
  // ----------------------------------------------------------

  if (
    els.editButton
  ) {

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

  if (
    els.googleButton
  ) {

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
