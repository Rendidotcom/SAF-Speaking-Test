/**
 * ==========================================
 * SAF Speaking Online Test
 * Exam Token Module
 * Stable Foundation v1.0
 * ==========================================
 */

let tokenList=[];

/* ==========================================
LOAD PAGE
========================================== */

async function loadExamPage(){

const content=document.getElementById("content");

content.innerHTML=`

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

<button class="btn teacher"
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

loadToken();

}

/* ==========================================
GENERATE TOKEN
========================================== */

async function generateExamToken(){

const kelas=document.getElementById("examClass").value;

const expired=document.getElementById("expiredMinute").value;

try{

const result=await api({

action:"createToken",

data:{

kelas,

expired

}

});

if(!result.success){

alert(result.message);

return;

}

alert("Token Created");

loadToken();

}catch(err){

console.log(err);

alert("Server Error");

}

}

/* ==========================================
LOAD TOKEN
========================================== */

async function loadToken(){

try{

const result=await api({

action:"getToken"

});

if(!result.success){

return;

}

tokenList=result.data||[];

renderToken();

}catch(err){

console.log(err);

}

}

/* ==========================================
RENDER
========================================== */

function renderToken(){

const tbody=document.getElementById("tokenTable");

const current=document.getElementById("currentToken");

if(!tbody)return;

tbody.innerHTML="";

let active=null;

tokenList.forEach(item=>{

if(item.status==="ACTIVE"){

active=item;

}

tbody.innerHTML+=`

<tr>

<td>${item.token}</td>

<td>${item.kelas}</td>

<td>${item.status}</td>

<td>${item.expired}</td>

<td>

<button
onclick="disableToken('${item.token}')">

Disable

</button>

<button
onclick="deleteToken('${item.token}')">

Delete

</button>

</td>

</tr>

`;

});

if(active){

current.innerHTML=`

<div class="card-box">

<h2>${active.token}</h2>

<p>

Class :

${active.kelas}

</p>

<p>

Expired :

${active.expired}

</p>

<p>

Status :

${active.status}

</p>

</div>

`;

}else{

current.innerHTML="No Active Token";

}

}

/* ==========================================
DISABLE
========================================== */

async function disableToken(token){

if(!confirm("Disable Token?"))return;

await api({

action:"disableToken",

data:{token}

});

loadToken();

}

/* ==========================================
DELETE
========================================== */

async function deleteToken(token){

if(!confirm("Delete Token?"))return;

await api({

action:"deleteToken",

data:{token}

});

loadToken();

}

/* ==========================================
SIDEBAR EVENT
========================================== */

document.querySelectorAll("[data-page]").forEach(menu=>{

menu.addEventListener("click",function(e){

e.preventDefault();

const page=this.dataset.page;

switch(page){

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