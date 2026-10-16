/* =========================================================
   script.js
   This file adds behavior that HTML and CSS cannot do alone:
   - open / close the mobile menu
   - highlight nothing extra, just close the menu after a click
   - check the contact form, then send it to Formspree
   - fade sections in as you scroll
========================================================= */

// Wait until the HTML is ready, then start the page features.
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupContactForm();
  setupScrollReveal();
});

/* ----- Mobile navigation ----- */
function setupMobileMenu() {
  const toggleButton = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector("#nav-menu");

  if (!toggleButton || !navMenu) {
    return;
  }

  // Open or close the menu when the hamburger button is clicked.
  toggleButton.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    toggleButton.classList.toggle("is-open", isOpen);
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    toggleButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  // After choosing a section, close the menu so the page is easier to read.
  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      toggleButton.classList.remove("is-open");
      toggleButton.setAttribute("aria-expanded", "false");
      toggleButton.setAttribute("aria-label", "Open menu");
    });
  });
}

/* ----- Contact form (checks fields, then sends to Formspree) ----- */
function setupContactForm() {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;

  if (!form || !status || !submitButton) {
    return;
  }

  // This public Formspree form URL is meant for websites. It is not a secret API key.
  const formspreeEndpoint = form.getAttribute("action");
  let isSending = false;

  form.addEventListener("submit", async (event) => {
    // Stay on this page instead of jumping to Formspree's website.
    event.preventDefault();

    if (isSending) {
      return;
    }

    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const message = form.querySelector("#message");

    clearErrors(form);
    status.textContent = "";
    status.className = "form-status";

    let isValid = true;

    if (!name.value.trim()) {
      showError("name", "Please enter your name.");
      isValid = false;
    }

    if (!email.value.trim()) {
      showError("email", "Please enter your email address.");
      isValid = false;
    } else if (!isValidEmail(email.value)) {
      showError("email", "Please enter a valid email, like name@example.com.");
      isValid = false;
    }

    if (!message.value.trim()) {
      showError("message", "Please write a short message.");
      isValid = false;
    } else if (message.value.trim().length < 10) {
      showError("message", "Please write at least 10 characters.");
      isValid = false;
    }

    if (!isValid) {
      status.textContent = "Please fix the highlighted fields.";
      status.classList.add("error");
      return;
    }

    isSending = true;
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    status.textContent = "Sending your message...";

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        status.textContent = "Thank you. Your message was sent successfully.";
        status.classList.add("success");
        form.reset();
      } else {
        status.textContent =
          "Sorry, the message could not be sent. Please try again in a moment.";
        status.classList.add("error");
      }
    } catch (error) {
      status.textContent =
        "Could not connect to the email service. Check your internet connection and try again.";
      status.classList.add("error");
    } finally {
      isSending = false;
      submitButton.disabled = false;
      submitButton.textContent = "Send message";
    }
  });
}

function showError(fieldId, text) {
  const field = document.querySelector("#" + fieldId);
  const error = document.querySelector('[data-error-for="' + fieldId + '"]');

  if (field) {
    field.classList.add("input-invalid");
  }

  if (error) {
    error.textContent = text;
  }
}

function clearErrors(form) {
  form.querySelectorAll(".input-invalid").forEach((field) => {
    field.classList.remove("input-invalid");
  });

  form.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function isValidEmail(value) {
  // Simple check: some text, an @, more text, a dot, then more text.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/* ----- Subtle fade-in as sections enter the screen ----- */
function setupScrollReveal() {
  const targets = document.querySelectorAll(
    ".about-grid, .skill-card, .project-card, .contact-layout"
  );

  targets.forEach((el) => el.classList.add("reveal"));

  // If the browser cannot observe scrolling, just show everything.
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}
