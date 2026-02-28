// CrowdCount Alert System
// Include this script + the alertBox div on any page to show server-driven alerts

(function () {
  var API_BASE = "https://api.crowdcount.tech";
  var SEEN_KEY_PREFIX = "crowdcount_alert_seen_";
  var isAlertVisible = false;
  var isSecondaryPage = false;

  function hasSeenAlert(alertId) {
    try {
      return sessionStorage.getItem(SEEN_KEY_PREFIX + alertId) === "true";
    } catch (e) {
      return false;
    }
  }

  function markAlertSeen(alertId) {
    try {
      sessionStorage.setItem(SEEN_KEY_PREFIX + alertId, "true");
    } catch (e) {}
  }

  function addBodyPadding() {
    if (isSecondaryPage) {
      document.body.style.transition = "padding-top 0.5s ease-in-out";
      document.body.style.paddingTop = "44px";
    }
  }

  function removeBodyPadding() {
    if (isSecondaryPage) {
      document.body.style.paddingTop = "";
    }
  }

  function hideAlert(box, dismiss) {
    if (!isAlertVisible) return;
    isAlertVisible = false;
    box.classList.remove("show");
    removeBodyPadding();
    setTimeout(function () {
      box.classList.add("hidden");
    }, 500);
    if (dismiss) {
      var alertId = box.getAttribute("data-alert-id");
      if (alertId) markAlertSeen(alertId);
    }
  }

  function ensureAlertBox() {
    var box = document.getElementById("alertBox");
    if (box) return box;

    // Create alertBox if it doesn't exist on this page
    box = document.createElement("div");
    box.id = "alertBox";
    box.className = "alert hidden";
    box.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;gap:8px;">' +
      '<div><strong id="alertTitle"></strong> <span id="alertBody"></span></div>' +
      '<button id="alertDismiss" style="background:none;border:none;color:inherit;font-size:18px;cursor:pointer;padding:4px 8px;opacity:0.7;">&times;</button>' +
      "</div>";
    document.body.insertBefore(box, document.body.firstChild);

    document.getElementById("alertDismiss").addEventListener("click", function () {
      hideAlert(box, true);
    });

    return box;
  }

  function getAlertColors(type) {
    switch (type) {
      case "warning":
        return { bg: "#ffcc00", color: "black" };
      case "celebration":
        return { bg: "#ffcc00", color: "black" };
      case "info":
        return { bg: "#007bff", color: "white" };
      case "privacy":
        return { bg: "#007bff", color: "white" };
      case "terms-of-use":
        return { bg: "#ff9500", color: "black" };
      case "leaf":
        return { bg: "#34c759", color: "black" };
      default:
        return { bg: "#333", color: "white" };
    }
  }

  function showAlert(alert) {
    var box = ensureAlertBox();
    var titleEl = document.getElementById("alertTitle");
    var bodyEl = document.getElementById("alertBody");

    if (titleEl) titleEl.textContent = alert.title || "";
    if (bodyEl) bodyEl.textContent = alert.body || "";

    var colors = getAlertColors(alert.alert_type);
    box.style.backgroundColor = colors.bg;
    box.style.color = colors.color;
    box.setAttribute("data-alert-id", alert.alert_id || "");

    box.classList.remove("hidden");
    setTimeout(function () {
      box.classList.add("show");
      isAlertVisible = true;
      addBodyPadding();
    }, 10);

    // Hide on scroll
    var scrollHandler = function () {
      if (window.scrollY > 50) {
        hideAlert(box, false);
        window.removeEventListener("scroll", scrollHandler);
      }
    };
    window.addEventListener("scroll", scrollHandler);
  }

  function checkForAlert() {
    fetch(API_BASE + "/check_if_alert", {
      headers: { "X-Client-Type": "web" },
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.is_alert) {
          fetchAlertDetails();
        }
      })
      .catch(function (err) {
        console.error("Error checking alert:", err);
      });
  }

  function fetchAlertDetails() {
    fetch(API_BASE + "/get_active_alert", {
      headers: { "X-Client-Type": "web" },
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var alerts = data.alert_info;
        if (alerts && alerts.length > 0) {
          var alert = alerts[0];
          if (!hasSeenAlert(alert.alert_id)) {
            showAlert(alert);
          }
        }
      })
      .catch(function (err) {
        console.error("Error fetching alert details:", err);
      });
  }

  // Run on DOM ready
  function init() {
    isSecondaryPage = document.body.id !== "home";
    checkForAlert();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
