export function renderUserData(data) {
    document.getElementById("content").innerHTML =
        `<div class="bg-dark p-5 rounded">
            <div class="mx-auto text-light" name="title">
              <div name="title" class="d-flex row text-secondary font-italic">
                <div class="col-1 d-flex"></div>
                <div class="col-auto">User name</div>
                <div class="col d-flex justify-content-end">User email</div>
                
                <div class="col d-flex justify-content-end">Registered</div>

                <div class="col d-flex justify-content-end">Role</div>
              </div>
            <div style="padding-block: 12px;"></div>
    
              <ul class="list-group list-group-flush">
                <div  name="filter-container">

                  ${data.map(at => 
                    `
                    <div class="col" id="appointment-time">
                    <li class="list-group-item bg-transparent text-light row d-flex px-0 mx-0"
                    >
                    
                    <div class="triangle-container col-1">
                      <div class="triangle" type="button" id="user_tr${data.indexOf(at)}" 
                      data-bs-toggle="collapse" href="#user${data.indexOf(at)}" aria-expanded="false" 
                    aria-controls="user${data.indexOf(at)}">&#9650;</div>
                    </div>
                    <div class="col">
                    ${at.name}
                    </div>
                    <div class="col">
                    ${at.email}
                    </div>
                    <div class="col justify-content-center d-flex">
                    ${at.is_active}
                   </div>
                    
                    
                  <div id="status" class="col d-flex justify-content-end">
                    <p >${at.role}</p>
                  </div>
                  <div class="collapse" id="user${data.indexOf(at)}">
                  
                  <div class="container-fluid">
                    <div class="row">
                      <div class="col-8">
                      
                        <div class="input-group">
                          <label class="form-group-prepend pr-2" for="emailField${data.indexOf(at)}">Email</label>
                          <input class="form-control" id="emailField${data.indexOf(at)}"/>
                        </div>


                        <div class="input-group">
                          <label class="form-group-prepend pr-2" for="passwordField${data.indexOf(at)}">Password</label>
                          <input class="form-control" id="passwordField${data.indexOf(at)}"/>
                        </div>
                        
                      
                        <div class="input-group">
                          <label class="form-group-prepend pr-2" for="roleField${data.indexOf(at)}">Role </label>
                          <input class="form-control" id="roleField${data.indexOf(at)}"/>
                        </div>
                        
                        <div>
                          <label for="isRegisteredField${data.indexOf(at)}">Active</label>
                          <input type="checkbox" checked="${at.is_active}" id="isRegisteredField${data.indexOf(at)}"/>
                        </div>
                        
                                        <!-- user form vége -->
                        <div class="col d-flex justify-content-end align-items-start">
                          <button class="btn btn-primary" id="editUser${data.indexOf(at)}">Edit user info</button>
                        </div>

                      </div>

                                      <!-- Jobb oldali col -->
                      <div class="col d-flex justify-content-end align-items-start">
                        <button class="btn btn-danger" id="deleteUser${data.indexOf(at)}">Delete</button>
                      </div>

                      
                    </div> <!--row-->
                  </div> <!--container-->
                  <hr>

                  ${at.pets.length>0 ? at.pets.map(pet => `
                  ${pet.pet_id}
                    <div class="card col-6">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">Pet's name:</li>
                        <li class="list-group-item">Pet's specie: ${pet.name}</li>
                        <li class="list-group-item">Pet's breed: ${pet.breed}</li>
                        <li class="list-group-item">Pet's birth date: ${pet.date_of_birth}</li>
                        <li class="list-group-item">Pet's sex: ${pet.sex}</li>
                      </ul>
                    </div>
                    <span class="col-auto">
                    <button class="btn btn-danger" id="removePet">Delete pet</button>
                    </span>
                    `) : '<div class="col-auto justify-content-center"><div>User has no pet.</div></div>'}
                  </div>
                </li>
                </div>`).join("")}
                </p>
              </ul>
            </div>
          </div>
        `
};

export function renderMedicalHistory(data) {
  document.getElementById("content").innerHTML = `
      <div class="bg-dark p-5 rounded">
          <div class="mx-auto text-light" name="title">
              <div name="title" class="d-flex row text-secondary font-italic">
                  <div class="col-1"></div>
                  <div class="col-auto">Pet name</div>
                  <div class="col">Request time</div>
                  <div class="col">Appointment time</div>
                  <div class="col d-flex justify-content-end">Status</div>
              </div>
              <div style="padding-block: 12px;"></div>
              <ul class="list-group list-group-flush">
                  <div name="filter-container">
                      ${data.map((entry, index) => `
                          <div class="col" id="appointment-${index}">
                              <li class="list-group-item bg-transparent text-light row d-flex px-0 mx-0">
                                  <div class="triangle-container col-1">
                                      <div class="triangle" type="button" id="entry_tr${index}"
                                          data-bs-toggle="collapse" href="#entry${index}" aria-expanded="false"
                                          aria-controls="entry${index}">&#9650;</div>
                                  </div>
                                  <div class="col-auto">${entry.pet?.name || 'Unknown'}</div>
                                  <div class="col">${new Date(entry.time_of_request).toLocaleString()}</div>
                                  <div class="col">${new Date(entry.time_of_appointment).toLocaleString()}</div>
                                  <div class="col d-flex justify-content-end">${entry.status}</div>
                                  <div class="collapse" id="entry${index}">
                                      <div class="card text-dark">
                                          <ul class="list-group list-group-flush">
                                              <li class="list-group-item"><strong>Species:</strong> ${entry.pet?.species || '-'}</li>
                                              <li class="list-group-item"><strong>Breed:</strong> ${entry.pet?.breed || '-'}</li>
                                              <li class="list-group-item"><strong>Birth date:</strong> ${entry.pet?.date_of_birth ? new Date(entry.pet.date_of_birth).toLocaleDateString() : '-'}</li>
                                              <li class="list-group-item"><strong>Sex:</strong> ${entry.pet?.sex || '-'}</li>
                                              <li class="list-group-item"><strong>Description:</strong> ${entry.description || '-'}</li>
                                              <li class="list-group-item"><strong>Diagnosis:</strong> ${entry.diagnosis || '-'}</li>
                                              ${entry.modified_by || entry.last_modification ? `
                                                  <li class="list-group-item"><strong>Modified by:</strong> ${entry.modified_by || '-'}</li>
                                                  <li class="list-group-item"><strong>Last modification:</strong> ${entry.last_modification ? new Date(entry.last_modification).toLocaleString() : '-'}</li>
                                              ` : ''}
                                          </ul>
                                      </div>
                                  </div>
                              </li>
                          </div>
                      `).join("")}
                  </div>
              </ul>
          </div>
      </div>
  `;
}


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
      
    if (totalPages > 1) {
      paginationHTML += `
      <li class="page-item hover ${index === totalPages ? 'active' : ''}"">
        <a class="page-link prevent-select" data-page="${totalPages}">${totalPages}</a>
      </li>`;
    }
  
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
