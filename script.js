
const userInput = document.getElementById("username");
const searchBtn = document.getElementById("searchBtn");
const profile = document.getElementById("profile");
const reposDiv = document.getElementById("repos");
const chart = document.getElementById("chart");
const message = document.getElementById("message");
const repoSection = document.getElementById("repoSection");
const sortRepos = document.getElementById("sortRepos");
const heroSection = document.getElementById("heroSection");

let repositories = [];

searchBtn.addEventListener("click", loadUser);
sortRepos.addEventListener("change", renderRepos);

async function loadUser(){

const username = userInput.value.trim();

if(!username){
showMsg("Please enter a username.");
return;
}

message.innerHTML = "";
profile.innerHTML = "";
reposDiv.innerHTML = "";
chart.innerHTML = "";

try{

const userRes = await fetch(
`https://api.github.com/users/${username}`
);

if(userRes.status === 404){
showMsg("GitHub user not found.");
return;
}

if(userRes.status === 403){
showMsg("GitHub API rate limit exceeded. Please try later.");
return;
}

const user = await userRes.json();

const repoRes = await fetch(user.repos_url);
repositories = await repoRes.json();

renderProfile(user);
renderRepos();
renderChart();

heroSection.style.display = "none";
repoSection.classList.remove("d-none");

}
catch{

showMsg("Something went wrong.");

}

}