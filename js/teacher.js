/**
 * ==========================================
 * SAF Speaking Online Test
 * Teacher Dashboard
 * Stable Foundation v2.0
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", init);

/* =====================================================
   INITIALIZE
===================================================== */

function init() {

    bindMenu();

    loadDashboard();

}

/* =====================================================
   MENU
===================================================== */

function bindMenu() {

    document.querySelectorAll("[data-page]").forEach(menu => {

        menu.addEventListener("click", function (e) {

            e.preventDefault();

            switch (this.dataset.page) {

                case "dashboard":
                    loadDashboard();
                    break;

                case "question":
                    loadQuestionPage();
                    break;

                case "student":
                    loadStudentPage();
                    break;

                case "token":
                    loadTokenPage();
                    break;

                case "result":
                    loadResultPage();
                    break;

            }

        });

    });

}

function setContent(html) {

    document.getElementById("content").innerHTML = html;

}

/* =====================================================
   DASHBOARD
===================================================== */

function loadDashboard() {

    setContent(`

        <h2>Dashboard</h2>

        <p>

        Welcome to SAF Speaking Online Test.

        </p>

    `);

}

/* =====================================================
   QUESTION PAGE
===================================================== */

function loadQuestionPage() {

    setContent(`

<h2>Speaking Question Database</h2>

<br>

<form id="questionForm">

<label>Topic</label>

<input
id="topic"
type="text"
placeholder="Greeting"
required>

<br><br>

<label>Speaking Question</label>

<textarea
id="question"
rows="5"
placeholder="Introduce yourself..."
required></textarea>

<br><br>

<label>Level</label>

<select id="level">

<option value="Easy">Easy</option>
<option value="Medium">Medium</option>
<option value="Hard">Hard</option>

</select>

<br><br>

<label>Time Limit (seconds)</label>

<input
id="timeLimit"
type="number"
value="30"
min="10"
required>

<br><br>

<button
type="submit"
class="btn teacher">

Save Question

</button>

</form>

<hr>

<div id="questionTable">

Loading database...

</div>

`);

    bindQuestion();

    loadQuestions();

}

/* =====================================================
   OTHER PAGE
===================================================== */

function loadStudentPage() {

    setContent("<h2>Students</h2>");

}

function loadTokenPage() {

    setContent("<h2>Exam Token</h2>");

}

function loadResultPage() {

    setContent("<h2>Speaking Results</h2>");

}

/* =====================================================
   SAVE QUESTION
===================================================== */

function bindQuestion() {

    document
        .getElementById("questionForm")
        .addEventListener("submit", saveQuestion);

}

async function saveQuestion(e) {

    e.preventDefault();

    const data = {

        topic: document.getElementById("topic").value.trim(),

        question: document.getElementById("question").value.trim(),

        level: document.getElementById("level").value,

        timeLimit: Number(
            document.getElementById("timeLimit").value
        )

    };

    const res = await apiInsertQuestion(data);

    if (!res.success) {

    tableMessage(res.message, "#d32f2f");

    return;

}

    if (res.success) {

        document.getElementById("questionForm").reset();

        document.getElementById("timeLimit").value = 30;

        loadQuestions();

    }

}

/* =====================================================
   LOAD QUESTION
===================================================== */

async function loadQuestions() {

    const res = await apiGetQuestion();

    const table = document.getElementById("questionTable");

    if (!res.success) {

        table.innerHTML = res.message;

        return;

    }

    if (res.data.length === 0) {

        table.innerHTML = "No speaking question.";

        return;

    }

    let html = `

<table
border="1"
width="100%"
cellpadding="8">

<tr>

<th>No</th>

<th>Topic</th>

<th>Question</th>

<th>Level</th>

<th>Time</th>

<th>Status</th>

</tr>

`;

    res.data.forEach((item, index) => {

        html += `

<tr>

<td>${index + 1}</td>

<td>${item.topic}</td>

<td>${item.question}</td>

<td>${item.level}</td>

<td>${item.timeLimit}s</td>

<td>${item.status}</td>

</tr>

`;

    });

    html += "</table>";

    table.innerHTML = html;

}