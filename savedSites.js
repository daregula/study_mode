document.addEventListener('DOMContentLoaded', () => {
    // open saved sites

    document.getElementById('test').addEventListener('click', async (event) => {
        event.preventDefault();
        const fetchUrls = async () => {
            const user_urls = await chrome.storage.local.get(['urls'])
            document.getElementById('user_saved_urls').innerHTML = user_urls.urls.map((url, idx) => "<li id='URL'>" + `${url.address}` + `"</li><img src='./icons/trash.svg' alt='trash icon' class='h-4 w-8 hover:cursor-pointer delete_btn' value='${idx}'/>"`)
        }
        await fetchUrls();

        // since we need to create multiple delete buttons on the fly we need to map them to our saved urls so we declared them of the same class name and looped through them adding an event listener to each one so when one of them gets clicked its specific to the url thats associated with it
        const delete_btns = document.querySelectorAll('.delete_btn');
        
        delete_btns.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const url_ID = button.getAttribute('value');
                chrome.runtime.sendMessage({ confirm_delete: true, remove_url: url_ID })
                
            })
        })
    })
    

});