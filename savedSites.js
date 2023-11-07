document.addEventListener('DOMContentLoaded', () => {
    // open saved sites

    const fetchUrls = async () => {
        const obj_user_urls = await chrome.storage.local.get(['urls_obj'])
        let display_saved_urls = [];
        
        Object.keys(obj_user_urls.urls_obj).forEach((key) => {
            display_saved_urls.push("<li id='URL' class='flex flex-row font-body text-[13px] gap-2'>" + `${key}` + `<button class='w-20 hover:cursor-pointer delete_btn bg-red-600 rounded p-1 text-white font-medium ' value='${key}'/> Delete </button> <button class='w-20 hover:cursor-pointer settings_btn bg-yellow-500 rounded p-1 text-white font-medium' value='${key}'/> Edit </button></li>`)
        });

        return display_saved_urls
    }

    const display_all_urls = async () => {
        
        document.getElementById('user_saved_urls').innerHTML = await fetchUrls();
        // since we need to create multiple delete buttons on the fly we need to map them to our saved urls so we declared them of the same class name and looped through them adding an event listener to each one so when one of them gets clicked its specific to the url thats associated with it
        const delete_btns = document.querySelectorAll('.delete_btn');
        
        delete_btns.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const url_ID = button.getAttribute('value');
                chrome.runtime.sendMessage({ confirm_delete: true, remove_url: url_ID })

                chrome.runtime.onMessage.addListener((message) => {
                    if (message.url_list_status){
                        display_all_urls();
                    }
                })
            })
        })

        const settings_btns = document.querySelectorAll('.settings_btn');

        settings_btns.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const url_ID = button.getAttribute('value');
                chrome.runtime.sendMessage({ edit_url: true, user_url: url_ID });
            })
        })
    }
    
    display_all_urls();

});