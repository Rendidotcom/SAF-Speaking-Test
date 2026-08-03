/**
 * ==========================================
 * SAF Speaking Online Test
 * Teacher Dashboard
 * Stable Foundation v3.0
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", init);

/* =====================================================
   GLOBAL STATE
===================================================== */

let editMode = false;
let selectedQuestionId = "";

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
id="btnSaveQuestion"
type="submit"
class="btn teacher">

Save Question

</button>

</form>

<br>

<input
id="searchQuestion"
type="text"
placeholder="🔍 Search topic or question..."
onkeyup="filterQuestion()">

<br><br>

<hr>

<div id="questionTable">

Loading database...

</div>

`);

    bindQuestion();

    function getLevelBadge(level) {

    switch (level) {

        case "Easy":
            return '<span class="badge easy">Easy</span>';

        case "Medium":
            return '<span class="badge medium">Medium</span>';

        case "Hard":
            return '<span class="badge hard">Hard</span>';

        default:
            return level;

    }

}

function getStatusBadge(status) {

    return '<span class="badge active">' + status + '</span>';

}

    loadQuestions();

}

/* =====================================================
   OTHER PAGE
===================================================== */

function loadStudentPage() {

    setContent("<h2>Students</h2>");

}

function loadTokenPage() {

    if (typeof loadExamPage === "function") {

        loadExamPage();

        return;

    }

    setContent(`
        <h2>Exam Token</h2>
        <p style="color:red">
            exam.js belum berhasil dimuat.
        </p>
    `);

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

    let res;

    if (editMode) {

        data.id = selectedQuestionId;

        res = await apiUpdateQuestion(data);

    } else {

        res = await apiInsertQuestion(data);

    }

    if (!res.success) {

        alert(res.message);

        return;

    }

    document.getElementById("questionForm").reset();

    document.getElementById("timeLimit").value = 30;

    editMode = false;

    selectedQuestionId = "";

    document.getElementById("btnSaveQuestion").innerText =
        "Save Question";

    loadQuestions();

}

/* =====================================================
   LOAD QUESTION
===================================================== */

async function loadQuestions() {

    const res = await apiGetQuestion();

    const table =
        document.getElementById("questionTable");

    if (!res.success) {

        table.innerHTML =

            "<p style='color:red'>" +

            res.message +

            "</p>";

        return;

    }

    updateQuestionCounter(res.data.length);

    if (res.data.length === 0) {

        table.innerHTML =

            "<p>No speaking question.</p>";

        return;

    }

    let html = `

<table
border="1"
width="100%"
cellpadding="8">

<tr>

<th width="60">No</th>

<th>Topic</th>

<th>Question</th>

<th width="90">Level</th>

<th width="80">Time</th>

<th width="80">Status</th>

<th width="170">Action</th>

</tr>

`;

    res.data.forEach((item, index) => {

        html += `

<tr>

<td>${index + 1}</td>

<td>${item.topic}</td>

<td>${item.question}</td>

<td>${getLevelBadge(item.level)}</td>

<td>${item.timeLimit}s</td>

<td>${getStatusBadge(item.status)}</td>

<td>

<button
class="btn edit"
onclick="editQuestion('${item.id}')">

✏ Edit

</button>

<button
class="btn delete"
onclick="deleteQuestion('${item.id}')">

🗑 Delete

</button>

</td>

</tr>

`;

    });

    html += "</table>";

    table.innerHTML = html;

}

/* =====================================================
   DASHBOARD COUNTER
===================================================== */

function updateQuestionCounter(total) {

    const card =

        document.getElementById("totalQuestion");

    if (card) {

        card.textContent = total;

    }

}
/* =====================================================
   EDIT QUESTION
===================================================== */

async function editQuestion(id) {

    const res = await apiGetQuestion();

    if (!res.success) {

        alert(res.message);

        return;

    }

    const item = res.data.find(q => q.id === id);

    if (!item) {

        alert("Question not found.");

        return;

    }

    editMode = true;

    selectedQuestionId = id;

    document.getElementById("topic").value =
        item.topic;

    document.getElementById("question").value =
        item.question;

    document.getElementById("level").value =
        item.level;

    document.getElementById("timeLimit").value =
        item.timeLimit;

    document.getElementById("btnSaveQuestion").innerText =
        "Update Question";

    document
        .getElementById("topic")
        .scrollIntoView({

            behavior: "smooth",
            block: "center"

        });

}

/* =====================================================
   DELETE QUESTION
===================================================== */

async function deleteQuestion(id) {

    const confirmDelete = confirm(

        "Delete this speaking question?"

    );

    if (!confirmDelete) {

        return;

    }

    const res = await apiDeleteQuestion({

        id: id

    });

    alert(res.message);

    if (res.success) {

        loadQuestions();

    }

}

/* =====================================================
   CANCEL EDIT
===================================================== */

function resetQuestionForm() {

    editMode = false;

    selectedQuestionId = "";

    const form =
        document.getElementById("questionForm");

    if (form) {

        form.reset();

    }

    const time =
        document.getElementById("timeLimit");

    if (time) {

        time.value = 30;

    }

    const btn =
        document.getElementById("btnSaveQuestion");

    if (btn) {

        btn.innerText = "Save Question";

    }

}


/* =====================================================
   SEARCH QUESTION
===================================================== */

function filterQuestion() {

    const keyword =
        document
        .getElementById("searchQuestion")
        .value
        .toLowerCase();

    const rows =
        document.querySelectorAll(
            "#questionTable table tbody tr"
        );

    rows.forEach(row => {

        const text =
            row.innerText.toLowerCase();

        row.style.display =
            text.includes(keyword)
            ? ""
            : "none";

    });

}

/* =====================================================
   END OF FILE
===================================================== */