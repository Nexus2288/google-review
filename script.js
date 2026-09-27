/*
  CAFE REVIEW SYSTEM
  Frontend logic + local review generator.

  No paid AI API is used in this version.
*/

const state = {
  rating: 0,
  experiences: [],
  items: [],
  note: "",
  generated: false,
  version: 0,
  scanId: createScanId()
};

const els = {
  cafeName: document.getElementById("cafeName"),
  cafeLocation: document.getElementById("cafeLocation"),
  brandMark: document.getElementById("brandMark"),
  footerCafeName: document.getElementById("footerCafeName"),
  socialTitle: document.getElementById("socialTitle"),

  stars: [...document.querySelectorAll(".star")],
  ratingLabel: document.getElementById("ratingLabel"),
  experienceChips: [...document.querySelectorAll("#experienceChips .chip")],
  itemChips: document.getElementById("itemChips"),
  note: document.getElementById("note"),
  charCount: document.getElementById("charCount"),

  generateButton: document.getElementById("generateButton"),
  preview: document.getElementById("reviewPreview"),
  reviewText: document.getElementById("reviewText"),
  editButton: document.getElementById("editButton"),
  regenerateButton: document.getElementById("regenerateButton"),
  googleButton: document.getElementById("googleButton"),

  socialButtons: [...document.querySelectorAll("[data-social]")]
};

const ratingLabels = {
  1: "Not great",
  2: "Could be better",
  3: "Good",
  4: "Really good",
  5: "Loved it!"
};

const templates = {
  5: [
    "Had a lovely experience at {cafe}.",
    "Really enjoyed my visit to {cafe}.",
    "Had such a nice time at {cafe}.",
    "Loved my experience at {cafe}."
  ],
  4: [
    "Had a really nice experience at {cafe}.",
    "Really enjoyed my visit to {cafe}.",
    "Had a very pleasant experience at {cafe}.",
    "Really liked my time at {cafe}."
  ],
  3: [
    "Had a good experience at {cafe}.",
    "Overall, I had a good visit to {cafe}.",
    "Had a pleasant visit to {cafe}.",
    "My visit to {cafe} was good overall."
  ],
  2: [
    "Visited {cafe} and wanted to share some feedback.",
    "I visited {cafe} and had a mixed experience.",
    "Had an average experience at {cafe}.",
    "My visit to {cafe} was okay overall."
  ],
  1: [
    "I visited {cafe} and wanted to share some honest feedback.",
    "I had a disappointing experience at {cafe}.",
    "My visit to {cafe} did not meet my expectations.",
    "I wanted to share my experience after visiting {cafe}."
  ]
};

const experiencePhrases = {
  Food: [
    "The food was really enjoyable",
    "I especially liked the food",
    "The food stood out for me"
  ],
  Drinks: [
    "The drinks were refreshing",
    "I really enjoyed the drinks",
    "The drinks were a nice highlight"
  ],
  Ambience: [
    "The ambience was cozy and inviting",
    "I really liked the ambience",
    "The atmosphere felt comfortable and welcoming"
  ],
  Service: [
    "The service was quick and smooth",
    "The service was attentive",
    "The service made the visit comfortable"
  ],
  Staff: [
    "The staff were friendly",
    "The staff were welcoming and helpful",
    "Everyone was friendly and polite"
  ],
  Value: [
    "The overall value felt good",
    "The experience felt worth it",
    "I felt the experience offered good value"
  ]
};

const itemPhrases = [
  "I tried {items} and enjoyed it",
  "I had {items} and really liked it",
  "The {items} I tried was a nice choice",
  "I especially enjoyed the {items}"
];

const closings = {
  positive: [
    "Would definitely visit again.",
    "Would be happy to come back.",
    "Looking forward to visiting again.",
    "I would happily come back."
  ],
  neutral: [
    "Overall, it was a pleasant visit.",
    "Overall, it was a decent experience.",
    "I hope to have an even better experience next time."
  ],
  negative: [
    "I hope the experience improves in the future.",
    "Sharing this feedback in the hope it helps improve the experience."
  ]
};

function createScanId() {
  return "SCN-" + Date.now().toString(36).toUpperCase() + "-" +
    Math.random().toString(36).slice(2, 7).toUpperCase();
}

function pick(list, offset = 0) {
  if (!list || !list.length) return "";
  return list[(state.version + offset) % list.length];
}

function escapeText(value) {
  return String(value ?? "").trim();
}

function applyCafeConfig() {
  const cafe = window.CAFE_CONFIG || {};

  const name = cafe.name || "Your Cafe";
  const location = cafe.location || "";

  els.cafeName.textContent = name;
  els.cafeLocation.textContent = location;
  els.footerCafeName.textContent = name;
  els.socialTitle.textContent = `Follow ${name}`;

  if (cafe.logo) {
    const img = document.createElement("img");
    img.src = cafe.logo;
    img.alt = `${name} logo`;
    img.onerror = () => img.remove();
    els.brandMark.textContent = "";
    els.brandMark.appendChild(img);
  } else {
    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0])
      .join("")
      .toUpperCase();

    els.brandMark.textContent = initials || "CA";
  }

  const items = Array.isArray(cafe.menuItems) ? cafe.menuItems : [];

  els.itemChips.innerHTML = "";

  items.forEach(item => {
    const button = document.createElement("button");
    button.className = "chip";
    button.type = "button";
    button.dataset.value = item.name;
    button.innerHTML = `${item.icon || "•"} <span>${item.name}</span>`;
    button.addEventListener("click", () => toggleChip(button));
    els.itemChips.appendChild(button);
  });

  els.socialButtons.forEach(button => {
    const platform = button.dataset.social;
    const url = cafe.social?.[platform] || "#";
    button.href = url;
    button.dataset.url = url;

    if (url === "#") {
      button.classList.add("disabled-social");
      button.addEventListener("click", event => event.preventDefault());
    } else {
      button.addEventListener("click", () => logEvent("social_click", {
        platform
      }));
    }
  });
}

function getSelected(chips) {
  return chips
    .filter(chip => chip.classList.contains("selected"))
    .map(chip => chip.dataset.value);
}

function syncState() {
  state.experiences = getSelected(els.experienceChips);
  state.items = getSelected([...els.itemChips.querySelectorAll(".chip")]);
  state.note = escapeText(els.note.value);
}

function setRating(value) {
  state.rating = value;

  els.stars.forEach(star => {
    const active = Number(star.dataset.rating) <= value;
    star.classList.toggle("active", active);
  });

  els.ratingLabel.textContent = ratingLabels[value] || "Tap a star to rate";
}

function toggleChip(chip) {
  chip.classList.toggle("selected");
  syncState();
}

function createItemSentence() {
  if (!state.items.length) return "";

  const selected = state.items.slice(0, 2);

  if (selected.length === 1) {
    return pick(itemPhrases).replace("{items}", selected[0]);
  }

  return pick(itemPhrases, 1)
    .replace("{items}", `${selected[0]} and ${selected[1]}`);
}

function createExperienceSentences() {
  return state.experiences.slice(0, 3).map((experience, index) => {
    const options = experiencePhrases[experience] || [];
    return pick(options, index);
  });
}

function buildReview() {
  syncState();

  const cafe = window.CAFE_CONFIG?.name || "the cafe";
  const rating = state.rating || 5;

  const opening = pick(templates[rating] || templates[5])
    .replace("{cafe}", cafe);

  const parts = [];

  const itemSentence = createItemSentence();
  if (itemSentence) parts.push(itemSentence + ".");

  const experienceSentences = createExperienceSentences();
  if (experienceSentences.length) {
    parts.push(experienceSentences.join(". ") + ".");
  }

  if (state.note) {
    const cleanNote = state.note.replace(/[.!?]+$/, "");
    parts.push(
      cleanNote.charAt(0).toUpperCase() +
      cleanNote.slice(1) +
      "."
    );
  }

  let closing;
  if (rating >= 4) closing = pick(closings.positive, 2);
  else if (rating === 3) closing = pick(closings.neutral, 1);
  else closing = pick(closings.negative, 1);

  return `${opening}${parts.length ? " " + parts.join(" ") : ""} ${closing}`;
}

function showValidation(message) {
  els.ratingLabel.textContent = message;
  els.ratingLabel.classList.add("validation-error");

  setTimeout(() => {
    els.ratingLabel.classList.remove("validation-error");
  }, 1200);
}

function generateReview() {
  syncState();

  if (!state.rating) {
    showValidation("Please choose a rating first.");
    els.stars[0]?.focus();
    return;
  }

  state.version += 1;

  els.generateButton.classList.add("loading");
  const label = els.generateButton.querySelector("span:nth-child(2)");

  if (label) label.textContent = "Creating your review...";

  setTimeout(() => {
    const review = buildReview();

    els.reviewText.textContent = review;
    els.reviewText.contentEditable = "false";
    els.reviewText.classList.remove("editing");

    els.preview.classList.add("show");
    state.generated = true;

    els.editButton.textContent = "✎ Edit";
    delete els.editButton.dataset.editing;

    els.generateButton.classList.remove("loading");

    if (label) label.textContent = "Create My Review";

    logEvent("review_generated", {
      rating: state.rating,
      experiences: state.experiences,
      items: state.items,
      review
    });

    els.preview.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 550);
}

function regenerateReview() {
  if (!state.generated) {
    generateReview();
    return;
  }

  state.version += 1;

  els.reviewText.contentEditable = "false";
  els.reviewText.classList.remove("editing");
  els.editButton.textContent = "✎ Edit";
  delete els.editButton.dataset.editing;

  els.reviewText.classList.remove("flash");
  void els.reviewText.offsetWidth;
  els.reviewText.classList.add("flash");

  const review = buildReview();
  els.reviewText.textContent = review;

  logEvent("review_regenerated", {
    rating: state.rating,
    review
  });
}

function enableEditing() {
  if (!state.generated) {
    generateReview();
    return;
  }

  els.reviewText.contentEditable = "true";
  els.reviewText.classList.add("editing");
  els.reviewText.focus();

  const range = document.createRange();
  range.selectNodeContents(els.reviewText);
  range.collapse(false);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  els.editButton.textContent = "✓ Save";
  els.editButton.dataset.editing = "true";
}

function saveEditing() {
  const editedReview = els.reviewText.textContent.trim();

  if (!editedReview) {
    els.reviewText.textContent = buildReview();
  }

  els.reviewText.contentEditable = "false";
  els.reviewText.classList.remove("editing");
  els.editButton.textContent = "✎ Edit";
  delete els.editButton.dataset.editing;

  logEvent("review_edited", {
    review: els.reviewText.textContent.trim()
  });
}

function continueToGoogle() {
  if (!state.generated) {
    generateReview();
    return;
  }

  const url = window.CAFE_CONFIG?.googleReviewUrl || "";

  if (!url || url.includes("PASTE_GOOGLE_REVIEW_LINK")) {
    alert("Google Review link has not been added in config.js yet.");
    return;
  }

  logEvent("google_click", {
    rating: state.rating,
    review: els.reviewText.textContent.trim()
  });

  window.open(url, "_blank", "noopener,noreferrer");
}

function logEvent(eventType, data = {}) {
  const endpoint = window.CAFE_CONFIG?.sheetsWebAppUrl || "";

  if (!endpoint || endpoint.includes("PASTE_")) return;

  const payload = {
    event: eventType,
    scanId: state.scanId,
    cafe: window.CAFE_CONFIG?.name || "",
    timestamp: new Date().toISOString(),
    ...data
  };

  /*
    no-cors is intentional for a simple Apps Script logging endpoint.
    The browser cannot read the response, but the POST can still reach
    the Apps Script web app.
  */
  fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {});
}

els.stars.forEach(star => {
  star.addEventListener("click", () => {
    setRating(Number(star.dataset.rating));
  });
});

els.experienceChips.forEach(chip => {
  chip.addEventListener("click", () => toggleChip(chip));
});

els.note.addEventListener("input", () => {
  els.charCount.textContent = els.note.value.length;
  syncState();
});

els.generateButton.addEventListener("click", generateReview);

els.regenerateButton.addEventListener("click", regenerateReview);

els.editButton.addEventListener("click", () => {
  if (els.editButton.dataset.editing === "true") {
    saveEditing();
  } else {
    enableEditing();
  }
});

els.googleButton.addEventListener("click", continueToGoogle);

document.querySelector(".icon-button")?.addEventListener("click", () => {
  const name = window.CAFE_CONFIG?.name || "this cafe";
  alert(`${name}\n\nThank you for sharing your experience.`);
});

applyCafeConfig();

// Initial scan event.
// This is sent once per page load when Sheets is connected.
logEvent("scan", {});
