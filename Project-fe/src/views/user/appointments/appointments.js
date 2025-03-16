const test_data = [
    {
      "_id": { "$oid": "67cc435449264ff52c2793f1" },
      "appointment_id": "a1b2c3d4-1111-2222-3333-444455556666",
      "time_of_request": "2025-03-10T10:00:00.000+00:00",
      "time_of_appointment": "2025-03-10T10:00:00.000+00:00",
      "diagnosis": null,
      "description": "Láthatóan fáradt, nem eszik rendesen.",
      "status": "Completed",
      "modified_by": null,
      "last_modification": null,
      "pet": {
        "name": "Bella",
        "date_of_birth": "2020-06-15",
        "specie": "Dog",
        "breed": "Golden Retriever",
        "description": "Nyugtalan, sokat vakarózik."
      },
      "owner": {
        "name": "John Doe",
        "email": "johndoe@example.com"
      }
    },
    {
      "_id": { "$oid": "67cc435449264ff52c2793f2" },
      "appointment_id": "b2c3d4e5-1111-2222-3333-555566667777",
      "time_of_request": "2025-03-10T10:00:00.000+00:00",
      "time_of_appointment": "2025-03-11T15:30:00.000+00:00",
      "diagnosis": null,
      "description": "Nem használja a bal hátsó lábát.",
      "status": "Pending...",
      "modified_by": null,
      "last_modification": null,
      "pet": {
        "name": "Whiskers",
        "date_of_birth": "2019-08-22",
        "specie": "Cat",
        "breed": "Siamese",
        "description": "Szokatlanul agresszív lett az utóbbi napokban."
      },
      "owner": {
        "name": "Alice Smith",
        "email": "alice.smith@example.com"
      }
    },
    {
      "_id": { "$oid": "67cc435449264ff52c2793f3" },
      "appointment_id": "c3d4e5f6-1111-2222-3333-777788889999",
      "time_of_request": "2025-03-10T10:00:00.000+00:00",
      "time_of_appointment": "2025-03-12T09:00:00.000+00:00",
      "diagnosis": null,
      "description": "Köhög és nehezen lélegzik.",
      "status": "Pending...",
      "modified_by": null,
      "last_modification": null,
      "pet": {
        "name": "Rocky",
        "date_of_birth": "2021-03-10",
        "specie": "Dog",
        "breed": "Bulldog",
        "description": "Lassú mozgás, étvágytalanság."
      },
      "owner": {
        "name": "Michael Brown",
        "email": "michael.brown@example.com"
      }
    }
  ]


  let template = ''
  test_data.map((apt, index) => {
      template += `
          <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center" id="heading${index}">
                  <div>
                      <strong>${apt.time_of_request}</strong> | ${apt.time_of_appointment} | <span class="badge bg-info">${apt.status}</span>
                  </div>
                  <button class="btn btn-link collapsed" data-bs-toggle="collapse" data-bs-target="#item${index}" aria-expanded="false">
                      <svg class="triangle" width="20" height="20" viewBox="0 0 24 24">
                          <path d="M7 10l5 5 5-5z"></path>
                      </svg>
                  </button>
              </div>
              <div id="item${index}" class="collapse" aria-labelledby="heading${index}" data-parent="#accordion">
                  <div class="card-body">
                      <div class="row">
                          <div class="col-md-6">
                              <strong>Pet Name:</strong> ${apt.pet.name} <br>
                              <strong>Species:</strong> ${apt.pet.specie} <br>
                              <strong>Breed:</strong> ${apt.pet.breed} <br>
                          </div>
                          <div class="col-md-6">
                              <strong>Description:</strong> ${apt.description}
                              <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24">
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15 3.93l3.75 3.75 1.96-1.96z"></path>
                              </svg>
                          </div>
                      </div>
                      ${apt.status === "Completed" ? `<div><strong>Diagnosis:</strong> ${apt.diagnosis || "N/A"}</div>` : ""}
                  </div>
              </div>
          </div>`;
  });
  
  document.getElementById("content").innerHTML = template;document.querySelectorAll('.collapse').forEach((collapse) => {
    collapse.addEventListener('show.bs.collapse', function () {
        this.previousElementSibling.querySelector('.triangle').style.transform = 'rotate(180deg)';
    });

    collapse.addEventListener('hide.bs.collapse', function () {
        this.previousElementSibling.querySelector('.triangle').style.transform = 'rotate(0deg)';
    });
});
  