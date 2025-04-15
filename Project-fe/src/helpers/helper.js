export function formatDate(date_param)
{
    if (date_param === null) return "Unknown / <br> Not set";

    let date = new Date(date_param);
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0');
    let yyyy = date.getFullYear();
    
    let hh = String(date.getHours()).padStart(2, '0');
    let min = String(date.getMinutes()).padStart(2, '0');
    let date_format =  yyyy + '-' + mm + '-' + dd + '<br>' + hh + ":" + min;
    return date_format;
}


export function datePickerFormat(date_param) {
    let date = new Date(date_param);
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0');
    let yyyy = date.getFullYear();
    let date_format =  yyyy + '-' + mm + '-' + dd;
    if (yyyy == 1970) return null;
    return date_format;
}

export function bindFormData(formId, data) {
    const form = document.getElementById(formId);
    delete data.id; //Vagy ez kell
    Object.keys(data).forEach(key => {
        try {
            if (form[key]) { // Vagy ez: && form[key] !== "assignForm"            
                form[key].value = data[key];
            }
        }
        catch (error) {
            console.log(error)
        }
    });
}

//Reusable card to display messages.
export function messageCard(message, subtitle) {
    return `
    <div class="card text-center">
        <div class='text-danger card-title'>${message}</div>
        <div class="card-text">${subtitle}</div>
    </div>  
    `
}
