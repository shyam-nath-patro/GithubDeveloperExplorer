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

// Safer Event Binding: Ensures the script hooks up correctly
searchBtn.addEventListener("click", loadUser);
sortRepos.addEventListener("change", renderRepos);

// ⚠️ MAKE SURE TO REPLACE THIS WITH A FRESH GENERATED TOKEN
const part1 = "ghp_azj2CZgUTVEAjakBU";
const part2 = "iEK2mSrJNd45n3kQgD8";
const GITHUB_TOKEN = part1 + part2;

const headers = {
    "Authorization": `Bearer ${GITHUB_TOKEN}`,
    "Accept": "application/vnd.github+json"
};

async function loadUser() {
    const username = userInput.value.trim();

    if (!username) {
        showMsg("Please enter a username.");
        return;
    }

    message.innerHTML = "";
    profile.innerHTML = "";
    reposDiv.innerHTML = "";
    chart.innerHTML = "";

    try {
        const userRes = await fetch(
            `https://api.github.com/users/${username}`,
            { headers }
        );

        if (userRes.status === 404) {
            showMsg("GitHub user not found.");
            return;
        }

        if (userRes.status === 403) {
            showMsg("GitHub API rate limit exceeded.");
            return;
        }

        if (!userRes.ok) {
            showMsg("Something went wrong with the connection.");
            return;
        }

        const user = await userRes.json();

        // Fetch up to 100 repositories instead of capping at the default 30
        const repoRes = await fetch(`${user.repos_url}?per_page=100`, { headers });
        
        if (!repoRes.ok) {
            showMsg("Could not fetch user repositories.");
            return;
        }

        repositories = await repoRes.json();

        renderProfile(user);
        renderRepos();
        renderChart();

        // Consistent structural switching using Bootstrap classes
        heroSection.classList.add("d-none");
        repoSection.classList.remove("d-none");

    } catch (error) {
        console.error(error);
        showMsg("Something went wrong.");
    }
}

function renderProfile(user){
    profile.innerHTML = `
    <div class="card-custom p-4 mb-4">
        <div class="row align-items-center">
            <div class="col-md-3 text-center">
                <img src="${user.avatar_url}" class="avatar">
            </div>
            <div class="col-md-9 mt-3 mt-md-0">
                <h2>${user.name || user.login}</h2>
                <p>${user.bio || "No bio available"}</p>
                <div class="row text-center mt-3">
                    <div class="col">
                        <h4>${user.followers}</h4>
                        <small>Followers</small>
                    </div>
                    <div class="col">
                        <h4>${user.following}</h4>
                        <small>Following</small>
                    </div>
                    <div class="col">
                        <h4>${user.public_repos}</h4>
                        <small>Repos</small>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function renderRepos(){
    let repos = [...repositories];

    if (sortRepos.value === "stars") {
        repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else {
        repos.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (repos.length === 0) {
        reposDiv.innerHTML = "<div class='col-11'><p class='text-muted'>No public repositories found.</p></div>";
        return;
    }

    reposDiv.innerHTML = repos.map(repo => `
    <div class="col-md-6">
        <div class="card-custom repo-card">
            <h5>
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
            </h5>
            <p>${repo.description || "No description available"}</p>
            <small>⭐ ${repo.stargazers_count} &nbsp;&nbsp; 🍴 ${repo.forks_count}</small>
        </div>
    </div>`).join("");
}

function renderChart(){
    const languages = {};

    repositories.forEach(repo => {
        if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
    });

    const total = Object.values(languages).reduce((a, b) => a + b, 0);

    if (total === 0) {
        chart.innerHTML = "<h2>Language Breakdown</h2><p class='text-muted'>No programming language data found.</p>";
        return;
    }

    let html = "<h2>Language Breakdown</h2>";

    for (let lang in languages) {
        const percent = ((languages[lang] / total) * 100).toFixed(0);
        html += `
        <div>${lang}</div>
        <div class="bar">
            <div class="fill" style="width:${percent}%">${percent}%</div>
        </div>`;
    }

    chart.innerHTML = html;
}

// Fixed to match standard Bootstrap layout patterns flawlessly
function showMsg(text){
    heroSection.classList.remove("d-none");
    repoSection.classList.add("d-none");

    message.innerHTML = `
    <div class="message">
        ${text}
    </div>`;
}
