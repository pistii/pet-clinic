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
  
  await fetchWithAuth("/api/users/getAll", {
    method: "POST",
    data: query
  }, 
).then(res => !res.ok ? showError(res) : success(res));
}

fetchData();

async function filter(event) {
  event.preventDefault();
  query.search = document.getElementById("searchByField").value;
  query.limit = parseInt(document.getElementById("limitField").value);
  query.page = 1;
  query.offset = 0;
  
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
  query.offset = Math.max(0, query.limit * (page - 1));
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