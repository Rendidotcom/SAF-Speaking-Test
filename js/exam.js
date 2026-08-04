/**
 * ==========================================
 * SAF Speaking Online Test
 * Exam Token Module
 * Stable Foundation v2.0
 * Frontend : Vercel
 * Backend  : Google Apps Script
 * ==========================================
 */

let tokenList = [];

/* ==========================================
LOAD PAGE
========================================== */
async function generateExamToken() {
    console.log("STEP 1");

const kelas = document.getElementById("examClass").value;
const expired = document.getElementById("expiredMinute").value;

console.log("STEP 2", kelas, expired);

const result = await apiCreateToken({
    kelas,
    expired
});

console.log("STEP 3", result);
}

async function loadExamPage() {

    const content = document.getElementById("content");

    content.innerHTML = `
<h2>🔑 Exam Token Management</h2>

<br>

<div class="form-grid">

<label>Class</label>

<select id="examClass">
<option>7A</option>
<option>7B</option>
<option>7C</option>
<option>7D</option>
</select>

<label>Expired (Minutes)</label>

<select id="expiredMinute">
<option value="30">30 Minutes</option>
<option value="60">60 Minutes</option>
<option value="90">90 Minutes</option>
<option value="120">120 Minutes</option>
</select>

<br><br>

<button
id="btnGenerateToken"
class="btn teacher"
onclick="generateExamToken()">

Generate Token

</button>

</div>

<hr style="margin:30px 0;">

<h3>Current Token</h3>

<div id="currentToken">

No Active Token

</div>

<br>

<h3>History</h3>

<table class="table">

<thead>

<tr>
<th>Token</th>
<th>Class</th>
<th>Status</th>
<th>Expired</th>
<th>Action</th>
</tr>

</thead>

<tbody id="tokenTable">

</tbody>

</table>
`;

    await loadToken();

}

/* ==========================================
GENERATE TOKEN
========================================== */

async function generateExamToken() {

    const kelas = document.getElementById("examClass").value;
    const expired = document.getElementById("expiredMinute").value;

    const btn = document.getElementById("btnGenerateToken");

    btn.disabled = true;
    btn.innerHTML = "Generating...";

    try {

        console.log("Create Token Request");

        const result = await apiCreateToken({

            kelas,
            expired

        });

        console.log(result);

        if (!result.success) {

            alert(result.message);

            return;

        }

        alert("Token Created Successfully");

        await loadToken();

    }

    catch (err) {

        console.error(err);

        alert("Server Error");

    }

    finally {

        btn.disabled = false;
        btn.innerHTML = "Generate Token";

    }

}

/* ==========================================
LOAD TOKEN
========================================== */

async function loadToken() {

    try {

        const result = await apiGetToken();

        console.log("Get Token");

        console.log(result);

        if (!result.success) {

            tokenList = [];

            renderToken();

            return;

        }

        tokenList = result.data || [];

        renderToken();

    }

    catch (err) {

        console.error(err);

    }

}

/* ==========================================
RENDER TOKEN
========================================== */

function renderToken() {

    const tbody = document.getElementById("tokenTable");
    const current = document.getElementById("currentToken");

    if (!tbody) return;

    tbody.innerHTML = "";

    let active = null;

    tokenList.forEach(item => {

        if (item.status === "ACTIVE") {

            active = item;

        }

        tbody.innerHTML += `
<tr>

<td>${item.token}</td>

<td>${item.kelas}</td>

<td>${item.status}</td>

<td>${item.expired}</td>

<td>

<button onclick="disableToken('${item.token}')">

Disable

</button>

<button onclick="deleteToken('${item.token}')">

Delete

</button>

</td>

</tr>
`;

    });

    if (active) {

        current.innerHTML = `
<div class="card-box">

<h2>${active.token}</h2>

<p><b>Class :</b> ${active.kelas}</p>

<p><b>Expired :</b> ${active.expired}</p>

<p><b>Status :</b> ${active.status}</p>

</div>
`;

    }

    else {

        current.innerHTML = "No Active Token";

    }

}

/* ==========================================
DISABLE TOKEN
========================================== */

async function disableToken(token) {

    if (!confirm("Disable this token?")) return;

    const result = await apiDisableToken({

        token

    });

    alert(result.message);

    await loadToken();

}

/* ==========================================
DELETE TOKEN
========================================== */

async function deleteToken(token) {

    if (!confirm("Delete this token?")) return;

    const result = await apiDeleteToken({

        token

    });

    alert(result.message);

    await loadToken();

}

/* ==========================================
SIDEBAR
========================================== */

document.querySelectorAll("[data-page]").forEach(menu => {

    menu.addEventListener("click", function (e) {

        e.preventDefault();

        switch (this.dataset.page) {

            case "dashboard":
                location.reload();
                break;

            case "question":
                loadQuestionPage();
                break;

            case "student":
                loadStudentPage();
                break;

            case "token":
                loadExamPage();
                break;

        }

    });

});