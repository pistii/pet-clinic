export const fillRegisteredUserAppointmentForm = () => {
    document.getElementById("content").innerHTML = 
    `<form id="appointmentForm" class="needs-validation g-3" novalidate>     
          <hr>

          <div class="form-group">
              <label for="petname">Pet Name</label>
              <input type="text" class="form-control" id="petname" placeholder="Enter pet's name" required>
              <div class="invalid-feedback">
                    Please fill out this field.
                </div>
          </div>
          <div class="form-group">
              <label for="dob">Date of Birth</label>
              <input type="date" class="form-control" id="dob">
          </div>

          <div class="form-group">
              <label for="species">Species</label>
              <input type="text" class="form-control" id="species" placeholder="Enter pet's species">
          </div>
          <div class="form-group">
              <label for="breed">Breed</label>
              <input type="text" class="form-control" id="breed" placeholder="Enter pet's breed">
          </div>

            <div class="ms-2">
                <div class="form-check form-group ">
                    <input class="form-check-input" type="radio" name="radio_gender" id="radio_female" value="female">
                    <label class="form-check-label" for="radio_female">
                        female
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="radio_gender" id="radio_male" value="male">
                    <label class="form-check-label" for="radio_male">
                        male
                    </label>
                </div>
            </div>
            
          <div class="form-group">
              <label for="description">Description</label>
              <textarea class="form-control" id="description" rows="3" placeholder="Describe your pet's issue" required></textarea>
                <div class="invalid-feedback">
                    Please fill out this field.
                </div>

          </div>
          
            <div id="informField" style="height:20px" class="my-2"></div>


           <div class="row">
                <div class="col">
                </div>

                <div class="col">
                    <button type="button" class="btn btn-primary btn-block" id="submit">Send</button>
                </div>
           </DIV>
      </form>`
}

export const fillExtendedAppointmentForm = () => {
    document.getElementById("content").innerHTML = 
    `<form id="appointmentForm" class="needs-validation g-3" novalidate>     
    
        <div class="form-group">
            <label for="name">Your Name</label>
            <input type="text" class="form-control" id="name" placeholder="Enter your name" required min-length="1">
            <div class="invalid-feedback">
                    Please fill out this field.
                </div>
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" class="form-control" id="email" placeholder="Enter your email" required>
            <div class="invalid-feedback">
                Email format is invalid.
            </div>
        </div>
          
          <hr>
          
          <div class="form-group">
              <label for="pet-name">Pet Name</label>
              <input type="text" class="form-control" id="petname" placeholder="Enter pet's name" required>
              <div class="invalid-feedback">
                Please fill out this field.
            </div>
          </div>
          <div class="form-group">
              <label for="dob">Date of Birth</label>
              <input type="date" class="form-control" id="dob">
          </div>
          <div class="form-group">
              <label for="species">Species</label>
              <input type="text" class="form-control" id="species" placeholder="Enter pet's species">
          </div>
          <div class="form-group">
              <label for="breed">Breed</label>
              <input type="text" class="form-control" id="breed" placeholder="Enter pet's breed">
          </div>


            <div class="ms-2">
                <div class="form-check form-group ">
                    <input class="form-check-input" type="radio" name="radio_gender" id="radio_female" value="female">
                    <label class="form-check-label" for="radio_female">
                        female
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="radio_gender" id="radio_male" value="male">
                    <label class="form-check-label" for="radio_male">
                        male
                    </label>
                </div>
            </div>
        
          <div class="form-group">
              <label for="description">Description</label>
              <textarea class="form-control" id="description" rows="3" placeholder="Describe your pet's issue" required max-length="500"></textarea>
              <div class="invalid-feedback">
                Please fill out this field.
            </div>
          </div>
          
           <div class="row">
                <div id="informField" style="height:20px" class="my-2"></div>

                <div class="col">
                    <a href="/login">Back to Login</a>
                </div>

                <div class="col">
                <button type="button" class="btn btn-primary btn-block" id="submit">Send</button>
                </div>
           </DIV>
      </form>`
}

