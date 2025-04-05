export function renderUserData(data) {
    document.getElementById("content").innerHTML =
        `<div class="bg-dark p-5 rounded">
          
            <div class="mx-auto text-light" name="title">
              <div name="title" class="d-flex row text-secondary font-italic">
                <div class="col-1"></div>
                <div class="col-auto">User name</div>
                <div class="col">User email</div>
                <div class="col"> 
                  <span type="button" class="dropdown-toggle dropdown-toggle-split" 
                  data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="sr-only">Appointment time</span>
                  </span>
                  <div class="dropdown-menu">
                    <a class="dropdown-item" href="#">Request time</a>
                    <a class="dropdown-item" href="#">Another action</a>
                    <a class="dropdown-item" href="#">Something else here</a>
                    <div role="separator" class="dropdown-divider"></div>
                    <a class="dropdown-item" href="#">Separated link</a>
                  </div>
                  </div>
  
                <div class="col d-flex justify-content-end">Appointment status</div>
              </div>
            <div style="padding-block: 12px;"></div>
    
              <ul class="list-group list-group-flush">
                <div  name="filter-container">
                
                  ${data.map(at => `<div class="col" id="appointment-time">
                    <li class="list-group-item bg-transparent text-light row d-flex px-0 mx-0"
                    >
                    
                    <div class="triangle-container col-1">
                      <div class="triangle" type="button" id="user_tr${data.indexOf(at)}" 
                      data-bs-toggle="collapse" href="#user${data.indexOf(at)}" aria-expanded="false" 
                    aria-controls="user${data.indexOf(at)}">&#9650;</div>
                    </div>
                    <div class="col-auto">
                    ${at.name}
                    </div>
                    <div class="col">
                    ${at.email}
                    </div>
                    <div class="col">
                    
                   </div>
                    
                  
                  <div id="status" class="col d-flex justify-content-end">
                    <p >${at.status}</p>
                  </div>
                  <div class="collapse" id="user${data.indexOf(at)}">
                    <div class="card">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">Pet's name: Csapszeg</li>
                        <li class="list-group-item">Pet's specie: Szög</li>
                        <li class="list-group-item">Pet's breed: Ütögető</li>
                        <li class="list-group-item">Pet's birth date: Valamikor</li>
                        <li class="list-group-item">Pet's sex: Valamilyen</li>
                        <li class="list-group-item">Pet's breed: Fajta</li>
                      </ul>
                    </div>
                  </div>
                </li>
                </div>`).join("")}
                </p>
              </ul>
            </div>
          </div>
        `
};

export function renderQuerySettings(query, callback) {
    document.getElementById("querySettings").innerHTML = 
    `
    <form id="searchForm">
        <div class="row p-3">

          <div class="col-auto">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">Search by:</span>
              </div>
              <input type="text" class="form-control" id="searchByField">
            </div>
          </div>


        <div class="col-auto">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id="">Limit:</span>
            </div>
            <input type="number" class="form-control" style="max-width:70px" id="limitField" value="${query.limit}">
          </div>
        </div>


        <div class="col-auto">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id="">Offset:</span>
            </div>
            <input type="number" class="form-control" style="max-width:70px" id="offsetField" value="${query.offset}">
          </div>
        </div>

        
        <div class="col d-flex justify-content-end align-items-end mx-4 px-0">
          <button class="btn btn-success" id="searchBtn">Search</button>
        </div>


      </div> <!--row-->

      </form>
      `

      document.getElementById("searchBtn").addEventListener("click", callback)
}


export function renderPagination(query) {
    let index = query.page;
    let totalPages = query.totalPages;

    let paginationHTML = "";
    
    paginationHTML += `
      <li class="page-item hover ${index === 1 ? 'active' : ''}">
        <a class="page-link prevent-select" data-page="${1}">${1}</a>
      </li>`;

    let startIndex = index === 1 || index == 2 ? 2 : index >= totalPages-2 ? totalPages-3 : index-1;
    let endIndex = totalPages <= startIndex+3 ? totalPages-1 : index+3 === totalPages ? index+2 : index+2;
    for (let i = startIndex; i <= endIndex; i++) {
      console.log(i)
      paginationHTML += `
          <li class="page-item hover ${i === index ? 'active' : ''}">
            <a class="page-link prevent-select" data-page="${i}"">${i}</a>
          </li>`;
      }
      
    paginationHTML += `
    <li class="page-item hover ${index === totalPages ? 'active' : ''}"">
      <a class="page-link prevent-select" data-page="${totalPages}">${totalPages}</a>
    </li>`;
  
  
    paginationHTML += `
    <li class="page-item hover ${index === totalPages ? 'disabled' : ''}">
      <a class="page-link prevent-select" data-page="${index+1}">Next</a>
    </li>
    </ul>
    </nav>
    `

    document.getElementById("pagination").innerHTML = paginationHTML;
    
}

// Creates watcher for triangles. If clicks on the element, it rotates back and forth.
export function watchExpanding() {
  document.querySelectorAll("[data-bs-toggle='collapse']").forEach((item) => {
    item.addEventListener("click", function () {
      const isExpanded = this.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        item.classList.add("rotated")
      } else {
        item.classList.remove("rotated");
      }
    });
  });
}
