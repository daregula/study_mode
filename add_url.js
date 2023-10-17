document.addEventListener('DOMContentLoaded', function() {
     // getting the url form values to get the users set days and times to have the urls open
   
    // displaying the current url thats been added to the add url popup
    document.getElementById('current_url').innerHTML = "shalom"
    
    chrome.runtime.sendMessage({ popUpOpen: true })
    chrome.runtime.onMessage.addListener((req) => {
        if (req.display_url){
            console.log("Fuck yea");
        }
    })
    // chrome.runtime.onMessage.addListener((message) => {
    //     console.log('anything');
    //     if (message.display_url){
                
    //             document.getElementById('url_form').addEventListener('submit', (event) => {
    //                 event.preventDefault();
    //                 const day_data = document.querySelectorAll('input[name="day"]:checked');
    //                 chrome.runtime.sendMessage({ day_data: day_data })
    //             });
    //         }
    //         else{
    //             console.log("message was not recieved");
    //         }
    // })
})