
// =========================================================
// SECTION 1: THEME INITIALIZATION
// Purpose: Restore the user's saved theme, defaulting to dark.
// =========================================================

(() => {
  "use strict";

  const STORAGE_KEY = "danish297-theme";
  const DEFAULT_THEME = "dark";

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      return saved === "light" || saved === "dark"
        ? saved
        : DEFAULT_THEME;
    } catch (error) {
      // Storage may be unavailable in restricted browsers.
      return DEFAULT_THEME;
    }
  }

  // =======================================================
  // SECTION 2: APPLY THEME
  // Purpose: Update the document theme and browser color scheme.
  // =======================================================

  function applyTheme(theme) {
    const normalizedTheme =
      theme === "light" ? "light" : "dark";

    document.documentElement.setAttribute(
      "data-theme",
      normalizedTheme
    );

    const button = document.querySelector(".theme-toggle");

    if (button) {
      const isDark = normalizedTheme === "dark";

      button.textContent = isDark ? "☀️" : "🌙";

      button.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );

      button.setAttribute(
        "title",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );

      button.setAttribute("aria-pressed", String(isDark));
    }

    try {
      localStorage.setItem(STORAGE_KEY, normalizedTheme);
    } catch (error) {
      // The theme still works if saving the preference fails.
    }
  }

  // =======================================================
  // SECTION 3: CREATE THE TOGGLE BUTTON
  // Purpose: Add the control to Quarto's existing navbar.
  // Avoid adding duplicate buttons during page initialization.
  // =======================================================

  function createToggleButton() {
    if (document.querySelector(".theme-toggle")) {
      return;
    }

    const navbar = document.querySelector(".navbar");

    if (!navbar) {
      return;
    }

    const button = document.createElement("button");

    button.type = "button";
    button.className = "theme-toggle";
    button.textContent = "☀️";
    button.setAttribute("aria-label", "Switch to light theme");
    button.setAttribute("title", "Switch to light theme");
    button.setAttribute("aria-pressed", "true");

    button.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme")
        || DEFAULT_THEME;

      applyTheme(
        currentTheme === "dark" ? "light" : "dark"
      );
    });

    // Prefer the right-hand navbar section.
    const rightNav = navbar.querySelector(
      ".navbar-nav.ms-auto"
    );

    const navbarCollapse = navbar.querySelector(
      ".navbar-collapse"
    );

    const target = rightNav || navbarCollapse;

    if (target) {
      target.appendChild(button);
    } else {
      navbar.appendChild(button);
    }

    // Synchronize the button with the active theme.
    applyTheme(getSavedTheme());
  }

  // =======================================================
  // SECTION 4: STARTUP
  // Purpose: Apply the theme and initialize the navbar control.
  // =======================================================

  applyTheme(getSavedTheme());

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      createToggleButton,
      { once: true }
    );
  } else {
    createToggleButton();
  }
})();

