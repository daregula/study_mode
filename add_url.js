document.addEventListener("DOMContentLoaded", () => {
     // getting the url form values to get the users set days and times to have the urls open
   
    // displaying the current url thats been added to the add url popup
    chrome.runtime.onMessage.addListener(async (message) => {
        try {
            // const updatedArr = await chrome.storage.local.get(['urls'])
            if (message.display_url){
                document.getElementById('current_url').innerHTML = "shalom"

                document.getElementById('url_form').addEventListener('submit', (event) => {
                    event.preventDefault();
                    const day_data = document.querySelectorAll('input[name="day"]:checked');
                    chrome.runtime.sendMessage({ day_data: day_data })
                });
            }
        } catch (error) {
            console.log(error);
        }
        
    })
})