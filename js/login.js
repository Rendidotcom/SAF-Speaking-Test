/**
 * ==========================================
 * SAF Speaking Online Test
 * Login Module
 * Version 1.0
 * ==========================================
 */

// ===============================
// Detect Login Role
// ===============================

const params = new URLSearchParams(window.location.search);

const role = params.get("role") || "student";

// ===============================
// Update UI
// ===============================

document.getElementById("loginTitle").textContent =
    role === "teacher"
        ? "Teacher Login"
        : "Student Login";

document.getElementById("loginSubtitle").textContent =
    role === "teacher"
        ? "Sign in using your teacher account."
        : "Sign in using your student account.";

// ===============================
// Login Form
// ===============================

const form = document.getElementById("loginForm");

form.addEventListener("submit", loginProcess);

// ===============================
// Login Process
// ===============================

async function loginProcess(e) {

    e.preventDefault();

    const username =
        document.getElementById("username")
        .value
        .trim();

    const password =
        document.getElementById("password")
        .value
        .trim();

    // ===========================
    // Validation
    // ===========================

    if (!username) {

        alert("Username is required.");

        return;

    }

    if (!password) {

        alert("Password is required.");

        return;

    }

    const button = document.querySelector(
        "#loginForm button[type='submit']"
    );

    const oldText = button.innerHTML;

    button.disabled = true;

    button.innerHTML = "Signing in...";

    try {

        const result = await apiLogin(

            username,

            password,

            role

        );

        if (!result.success) {

            alert(result.message);

            button.disabled = false;

            button.innerHTML = oldText;

            return;

        }

        // =======================
        // Save Session
        // =======================

        sessionStorage.setItem(

            CONFIG.SESSION_KEY,

            JSON.stringify(result.user)

        );

        if (result.token) {

            sessionStorage.setItem(

                CONFIG.TOKEN_KEY,

                result.token

            );

        }

        // =======================
        // Success
        // =======================

        alert("Login successful.");

        if (role === "teacher") {

            window.location.href =
                "dashboard_teacher.html";

        } else {

            window.location.href =
                "dashboard_student.html";

        }

    } catch (err) {

        console.error(err);

        alert("Unable to connect to server.");

    }

    button.disabled = false;

    button.innerHTML = oldText;

}

// ===============================
// Auto Login Check
// ===============================

(function () {

    const session = sessionStorage.getItem(

        CONFIG.SESSION_KEY

    );

    if (!session) return;

    try {

        const user = JSON.parse(session);

        if (user.role === "teacher") {

            window.location.href =
                "dashboard_teacher.html";

        }

        if (user.role === "student") {

            window.location.href =
                "dashboard_student.html";

        }

    } catch (e) {

        sessionStorage.removeItem(

            CONFIG.SESSION_KEY

        );

    }

})();