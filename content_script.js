/* Promotify Chrome Extension  
 * author: Jared McReynolds
 */

 const seperator = '----------------------'

/**
 * find out what the browser is
 **/
var chrome_browser;
navigator.browserInfo= (function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();
if(navigator.browserInfo.indexOf('Firefox') != -1){
    chrome_browser = browser;
}else{
    chrome_browser = chrome;
}

const allTasks = new Set()

/** Gets the token from local storage of the page.
*
*/
function get_token(){
    var token = JSON.parse(window.localStorage.getItem("token"));

    var script = document.createElement("script");
    script.setAttribute("type", "application/javascript");
    script.innerHTML = token;

    var script_button = document.getElementById("gttButton");
    script_button.appendChild(script);

    chrome.runtime.sendMessage({token: token, URL: document.URL}, function(response) {
    });

}
/** Adds a button when the extension icon is clicked
* and the extension loaded.
*
*/
function insert_button(){
    var button_text = document.createTextNode("Promotify");
    button_text.id = "button_text";

    var new_button = document.createElement('button');
    new_button.id = "promotify_button";
    new_button.appendChild(button_text);

    var currentSidebar = document.getElementsByClassName("ng-pristine ng-untouched ng-valid");
        currentSidebar[12].appendChild(new_button);
}

const observer = new window.MutationObserver(mutations => {
    const tasks = document.querySelectorAll('.taskEntry')

    // filter out tasks we've already rendered
    const tasksToRender = Array.from(tasks).filter(task => !allTasks.has(task))

    // add all the tasks to the Set
    tasks.forEach(task => allTasks.add(task))

    tasksToRender.forEach(doStuff)
})
const doStuff = function (task) {
    const addCardButton = document.createElement('span');
    addCardButton.innerHTML = "\n\
<span id=\"gttButton\" class=\"T-I J-J5-Ji ar7 nf T-I-ax7 L3 label\" data-tooltip=\"Add this card to Trello\">\n\
    <div aria-haspopup=\"true\" role=\"button\" class=\"J-J5-Ji W6eDmd L3 J-J5-Ji Bq L3\" tabindex=\"0\" style=\"display: inline-block;\">\n\
        <span class=\"button-text\">Taiga</span>\n\
    </div>\n\
</span>";

    task.querySelector('.taskHeader div div').appendChild(addCardButton)

    addCardButton.addEventListener("click", function (event) {
        var mytask = {};
        mytask.taskId = task.querySelector('[name="taskId"]').value
        mytask.title = task.querySelector('.taskContent').children[0].innerHTML
        mytask.body = task.querySelector('.taskContent').children[1].innerText
        if (mytask.body.indexOf(seperator) === 0) {
            mytask.description = mytask.body.split(seperator)[1]
            mytask.description = mytask.description.split("\n").map(x => x.trim()).join("\n").trim()
        } else {
            mytask.description = body
        }
        json_task = JSON.stringify(mytask);
        var token = JSON.parse(window.localStorage.getItem("token"));

        var script = document.createElement("script");
        script.setAttribute("type", "application/javascript");
        script.innerHTML = token;

        var script_button = document.getElementById("gttButton");
        script_button.appendChild(script);

        chrome.runtime.sendMessage({token: token, URL: document.URL, task: json_task}, function(response) {
        });
    });
}

/**
 * Handle request from background.js
 * @param  request      Request object, contain parameters
 * @param  sender       
 * @param  sendResponse Callback function
 */
function requestHandler(request, sender, sendResponse) {
    switch (request.message) {
        case "initialize":
            //console.log('first run');
            observer.observe(document.body, {childList: true, subtree: true})
            /**/
            break;
    }
}

chrome_browser.extension.onMessage.addListener(requestHandler);
//insert_button();



