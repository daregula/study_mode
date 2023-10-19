document.addEventListener('DOMContentLoaded', function() {
     // getting the url form values to get the users set days and times to have the urls open
   
    // displaying the current url thats been added to the add url popup
    document.getElementById('current_url').innerHTML = "shalom"
    
    chrome.runtime.sendMessage({ popUpOpen: true })

    chrome.runtime.onMessage.addListener((message) => {
        if (message.display_url){
                document.getElementById('current_url').innerHTML = message.current_url
                document.getElementById('url_form').addEventListener('submit', (event) => {
                    event.preventDefault();
                    let day_data = document.querySelectorAll('input[name="day"]:checked');
                    day_data = Array.from(day_data).map(x => x.value)
                    // process the data then send it over to the background script


                    chrome.runtime.sendMessage({ res_day_data: true, day_data: day_data, user_url: message.current_url })
                });
            }
            else{
                console.log("message was not recieved");
            }
    })
})