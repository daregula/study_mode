document.addEventListener('DOMContentLoaded', function() {
     // getting the url form values to get the users set days and times to have the urls open
   
    // displaying the current url thats been added to the add url popup
    document.getElementById('current_url').innerHTML = "shalom"
    
    chrome.runtime.sendMessage({ popUpOpen: true })

    chrome.runtime.onMessage.addListener((message) => {
        if (message.display_url){
                document.getElementById('current_url').innerHTML = message.current_url
                const form = document.getElementById('url_form');

                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    // process the data then send it over to the background script

                    const days = form.elements['day[]'];
                    const start_times = form.elements['start_time[]'];
                    const end_times = form.elements['end_time[]'];

                    const selectedData = {};

                    for (let i = 0; i < days.length; i++) {
                        if (days[i].checked) {
                            selectedData[days[i].value] = {
                                start_time: start_times[i].value,
                                end_time: end_times[i].value
                            }
                        }
                    }
                    
                    chrome.runtime.sendMessage({ res_day_data: true, day_data: selectedData, user_url: message.current_url })
                });
            }
            else{
                console.log("message was not recieved");
            }
    })
})