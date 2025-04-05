import { renderUserData, renderQuerySettings, renderPagination, watchExpanding } from "./template";
import { messageCard } from "../../helpers/helper";

let query = {
  search: "",
  limit: 25,
  offset: 0,
  page: 1,
  totalPages: 0
}

async function fetchData() {
  await fetch(`${SERVER_URL}/api/users/getAll`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(query)
  }).then(res => !res.ok ? showError(res) : success(res));
}

fetchData();

async function filter(event) {
  event.preventDefault();
  let search = document.getElementById("searchByField").value;
  let limitField = document.getElementById("limitField").value;
  let offsetField = document.getElementById("offsetField").value;
  console.log(search, limitField, offsetField)

  await fetchData();
}


async function success(res) { 
    let json_resp = await res.json(); 
    let users = json_resp.users;
    query.totalPages = json_resp.totalPages;
    
    renderQuerySettings(query, filter);
    renderUserData(users);
    renderPagination(query);
    watchExpanding();

    //Kinyerjük a kiválasztott oldalszámot
    document.querySelectorAll(".page-link").forEach(el => {
      el.addEventListener("click", () => {
        const page = Number(el.dataset.page);
        changePage(page);
      });
    });

}

async function changePage(page) {
  //Prepare data
  query.offset = page == 1 ? query.limit - query.offset : query.limit*(page-1);
  query.page = page;

  //Scroll to top
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  await fetchData();
}


async function showError(msg) {
  let parsed_msg = await msg.json();
  document.getElementById("content").innerHTML = 
  messageCard("Failed to load users. See exception:", parsed_msg.detail || parsed_msg);
}