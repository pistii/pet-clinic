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