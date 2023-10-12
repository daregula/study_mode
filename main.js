document.addEventListener('DOMContentLoaded',function() {


    const minutesElement = document.getElementById('minutes');
    

    let minutes = 0;

    // Function to update the timer display
    function updateTimerDisplay() {
        minutesElement.textContent = minutes.toString().padStart(2, '0');
    }

    // Function to handle scrolling up (increase time)
    function scrollUp() {
        if (minutes < 59) {
            minutes++;
        } else {
            minutes = 0;
        }
        updateTimerDisplay();
    }

    // Function to handle scrolling down (decrease time)
    function scrollDown() {
        if (minutes > 0) {
            minutes--;
        } else {
            minutes = 59;
        }
        updateTimerDisplay();
    }

    // Event listeners for scroll events
    window.addEventListener('wheel', (event) => {
        if (event.deltaY < 0) {
            // Scrolling up
            scrollUp();
        } else {
            // Scrolling down
            scrollDown();
        }
    });

    // Initialize the timer display
    updateTimerDisplay();


    document.getElementById('startTimer').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, () => {
            chrome.runtime.sendMessage({ startTimer: true });
            
        });
    });
    
    document.getElementById('stopTimer').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, () => {
            chrome.runtime.sendMessage({ startTimer: false });
            
        })
    });

    // grabbing changes from the timer form and sending a message over to through our runtime interface
    document.getElementById('timerform').addEventListener('submit', (event) => {
        event.preventDefault();
        // const timevalue = document.getElementById('time').value;
        chrome.runtime.sendMessage({ timerform: minutes });
        
    });

    // getting a saved website from the user to pass as a url to the tab create function
    document.getElementById('toOpen').addEventListener('submit', (event) => {
        event.preventDefault();

        const user_url = document.getElementById('tabAddress').value;
        chrome.runtime.sendMessage({ user_url: user_url, toOpen: true})
    })

    // our countdown timer that shows up in the front-end of the extension but for now were going to comment this out unitl
    // we can fix the dumbass bug
        
    chrome.runtime.onMessage.addListener((req) => {
        if (req.updateTimer){
            document.getElementById('runningTimer').innerHTML = req.time
        }
        
    })    

    // grabbing the id of our study button to see if we can trigger a test opening of a tab that we will manually input

    document.getElementById('start').addEventListener('click', (event) => {
        event.preventDefault();
        chrome.runtime.sendMessage({ openTab: true })
    })

    // open saved sites popup
    document.getElementById('seeSites').addEventListener('click', (event) => {
        event.preventDefault();
        chrome.runtime.sendMessage({ seeSites: true })
    })

    chrome.runtime.onMessage.addListener((req) => {
        if (!req.hasUrls){
            document.getElementById('warning').innerHTML = 'You do not have any saved urls yet'
        }
        else{
            document.getElementById('warning').innerHTML = ''
        }
    })

});
