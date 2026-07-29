/**
 * ==========================================
 * SAF Teacher Dashboard
 * Version 1.0
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", init);

function init(){

    bindMenu();

    loadDashboard();

}

function bindMenu(){

    document.querySelectorAll("[data-page]").forEach(menu=>{

        menu.addEventListener("click",function(e){

            e.preventDefault();

            const page=this.dataset.page;

            switch(page){

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

function setContent(html){

    document.getElementById("content").innerHTML=html;

}

function loadDashboard(){

    setContent(`

        <h2>Dashboard</h2>

        <p>Selamat datang di SAF Speaking Online Test.</p>

    `);

}

function loadQuestionPage(){

setContent(`

<h2>Speaking Question Database</h2>

<br>

<form id="questionForm">

<label>Question Title</label>

<input
id="title"
type="text"
placeholder="Greeting"

<br><br>

<label>Answer Key</label>

<textarea
id="answer"
rows="5"
placeholder="Good morning everyone."></textarea>

<br><br>

<label>Difficulty</label>

<select id="difficulty">

<option>Easy</option>

<option>Medium</option>

<option>Hard</option>

</select>

<br><br>

<label>Duration (seconds)</label>

<input
id="duration"
type="number"
value="30">

<br><br>

<button
class="btn teacher"
type="submit">

Save Question

</button>

</form>

<hr>

<div id="questionTable">

Loading Database...

</div>

`);

bindQuestion();

loadQuestions();

}

function loadStudentPage(){

    setContent("<h2>Students</h2>");

}

function loadTokenPage(){

    setContent("<h2>Exam Token</h2>");

}

function loadResultPage(){

    setContent("<h2>Speaking Results</h2>");

}

function bindQuestion(){

document

.getElementById("questionForm")

.addEventListener("submit",saveQuestion);

}

async function saveQuestion(e){

e.preventDefault();

const data={

title:

title.value,

answer:

answer.value,

difficulty:

difficulty.value,

duration:

duration.value,

createdBy:"Administrator"

};

const res=

await callAPI(

"insertQuestion",

data

);

alert(res.message);

loadQuestions();

}

async function loadQuestions(){

const res=

await callAPI(

"getQuestion"

);

if(!res.success){

document

.getElementById("questionTable")

.innerHTML="Database kosong.";

return;

}

let html=`

<table border="1"

width="100%"

cellpadding="8">

<tr>

<th>Title</th>

<th>Difficulty</th>

<th>Duration</th>

</tr>

`;

res.data.forEach(item=>{

html+=`

<tr>

<td>${item.title}</td>

<td>${item.difficulty}</td>

<td>${item.duration}s</td>

</tr>

`;

});

html+="</table>";

document

.getElementById("questionTable")

.innerHTML=html;

}