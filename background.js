/* Promotify Chrome Extension 
 * author: Jared McReynolds
 */

const seperator = '----------------------'
var cardData;

var taigaApp = {
    settings_page: "options.html",
    taigaURL: "",
    tusername: "",
    tpassword: "",
    populateStorage: function () {
        localStorage.setItem('taigaURL', '');
        localStorage.setItem('username', '');
        localStorage.setItem('password', '');
        this.loadCredentials();
    },
    loadCredentials: function () {
        this.taigaURL = localStorage.getItem('taigaURL');
        this.tusername = localStorage.getItem('username');
        this.tpassword = localStorage.getItem('password');
        var auth_req = new XMLHttpRequest();
        auth_req.open("POST", this.taigaURL + "/api/v1/auth", false);
        auth_req.setRequestHeader('Content-Type', 'application/json');
        //auth_req.setRequestHeader('Authorization', 'Bearer ' + auth_token);
        var request_data = JSON.stringify({"password": this.tpassword, "type": "normal", "username": this.tusername});
        auth_req.send(request_data);
        auth_token = JSON.parse(auth_req.responseText);
        localStorage.setItem('token', auth_token.auth_token);
        this.auth_token = auth_token.auth_token;
    },
    saveCredentials: function () {
        localStorage.setItem('taigaURL', this.taigaURL);
        localStorage.setItem('username', this.tusername);
        localStorage.setItem('password', this.tpassword);
    }
}

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

taigaApp.loadCredentials();
/**
 * Detect Orbit's URL everytimes a tab is reloaded or openned
 */
chrome_browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        checkForValidUrl(tab);
    }
});

/**
 * Manage local storage between extension & content script
 */
chrome_browser.extension.onMessage.addListener(function(request, sender, sendResponse) {
    // local storage request
    if (request.storage) {
        if (typeof request.value !== 'undefined') {
            localStorage[request.storage] = request.value;
            console.log(localStorage);
        }
        sendResponse({storage: localStorage[request.storage]});
    } else {
        sendResponse({});
    }
});

/**
 * Check if current URL is on Orbit
 * @param  https://developer.chrome.com/extensions/tabs#type-Tab tab Tab to check
 * @return bool     Return True if you're on Orbit
 */
function checkForValidUrl(tab) {
    if ((tab.url.indexOf('https://beta-crm.mayden.co.uk/tasks/')) == 0 || (tab.url.indexOf('https://crm.mayden.co.uk/tasks/') == 0)) {
        chrome_browser.pageAction.show(tab.id);
        
        //console.log(tab.url);
        
        // Call content-script initialize function
        chrome_browser.tabs.sendMessage(
            //Selected tab id
            tab.id,
            //Params inside a object data
            {message: "initialize"},
            //Optional callback function
            function(response) {
                //console.log(response);
                //update panel status
                //app.tabs[tab.id].panel.visible = response.status;
                //updateIconStatus(tab.id) 
            }
        );
    }
}

var api_url = taigaApp.taigaURL + "/api/v1";
var user_stories_url = api_url + "/userstories"
var token;
var url_string = "";
var received = false;


/* Eventlistener waiting for a message from the content_script
*
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (typeof request != 'undefined'){
        //token = request.token;
        token = taigaApp.auth_token
        CURRENT_TAB_URL = request.URL;
        received = true;
        sendResponse({greeting: "Got Token"});
    }

    if(received == true){
      main(request.task);
    }
});

/* Processes the passed in url_string to get the current issue 
* number.
*/
function get_issue_number(url_string){
    var path_array = url_string.split('/');

    var issue_num;
    for(var i = 0; i < path_array.length; i++){
        if(i == path_array.length-1){
            issue_num  = path_array[i];
        }
    }

    return issue_num;
}

/* Makes the XMLHttpRequest to the api
*
*/
function make_http_request(method, url, data, bearerHeader, async, auth_token){
    var req = new XMLHttpRequest();

    req.open(method, url, false);
    req.setRequestHeader('Content-Type', 'application/json');
    if(bearerHeader){
        req.setRequestHeader('Authorization', 'Bearer ' + auth_token);
    }
    req.send(data);
    
    if(req.status == 401){
        alert('All of the broken!');
    }
    return req;
}

/* Function to get the project slug from the current tab url
*
**/
function get_proj_slug(url_string){

    var path_array = url_string.split('/');
    var proj_slug;

    for(var i = 0; i < path_array.length; i++){
       if(path_array[i] == "project"){
       proj_slug = path_array[i+ 1];
       }
    }
    
    return proj_slug;
}

/* Get the project id using the url slug in order to get the issue that we need.
*
* @param {Object} Response body from an Http response
* @return {string} Project id number
* */
function get_project_id(http_req){
    var http_response_text = JSON.parse(http_req.responseText);
    var project_id = http_response_text.id;

    return project_id;
}

/* Function that uses the issue by ref number and project id to collect the
* issue's description
*
* @param {Object} Response body from an Http response
* @return {string} Issue description
* */
function get_issue_description(http_req){

    var http_response_text = JSON.parse(http_req.responseText);
    var issue_desc = http_response_text.description;
    return issue_desc;
}

/* Function that take in information about an issue's subject to use
* for the new user story
*
* @param {Object} Response body from an Http response
* @return {string} Issue subject
* */
function get_issue_subject(http_req){

    var http_response_text = JSON.parse(http_req.responseText);
    var issue_subject = http_response_text.subject;
    return issue_subject;
}

/* Uses information gathered from issue to make a new user story.
 *
 * @param {number} project_id The id for the project the user story will be placed
 * @param {string} subject The subject of the issue that will be transferred to the user story
 * @param {string} issue_description The description of the issue that will be transferred to the user story
 *
 * */
function promote_issue(full_url, project_id, subject, issue_description, auth_token){
    var request_data = JSON.stringify({"project": project_id,
                        "subject": subject,
                        "description": issue_description});

    var response = make_http_request("POST", full_url, request_data, true, false, auth_token);
    var http_response_text = JSON.parse(response.responseText);

    user_story_id = http_response_text.id;
    return user_story_id;

}

/*Function that adds a tasks to the user story just created.
 *
 *@param {number} project_id The id for the project the user story will be placed
 *@param {number} us_id The id of the user story where the task will be added
 *@param {number} subject The string from the description that will become the tasks subject
 *@param {number} index Index of the array of tasks
 * */
function create_subtasks(project_id, us_id, subject, index, auth_token){
    //Url needed to create a task
    var full_url = api_url + "/tasks";

    //Required information to add tasks
    var request_data = JSON.stringify({"user_story": us_id ,
                                   "subject": subject,
                                   "project": project_id,
                               "description": index});

    var response = make_http_request("POST", full_url, request_data, true, false, auth_token);
    var http_response_text = JSON.parse(response.responseText);

    return http_response_text.status;
}

/* Gather information from the issue description for creating sub-tasks
*
*@param {string} description The description taken from the issue to be parse into sub-tasks for the new user story
*@param {number} project_id Project id of the user story to which tasks will be added
*@param {number} user_story_id Id of of the user story to which tasks will be added
* */
function add_tasks(description, project_id, user_story_id, auth_token){

    var description_array = description.split(",");
    var all_tasks_array = [];

    for(var i= 0; i < description_array.length; i++){
       var individual_task_array = [];
       individual_task_array = description_array[i].split(">");
       all_tasks_array.push(individual_task_array);
    }

    for(var j = 0; j < all_tasks_array.length; j++){

      (create_subtasks(project_id, user_story_id, all_tasks_array[j][0], all_tasks_array[j][1], auth_token));
    }
}

/* Extracts all the information need to make the new user story 
* from all the respective places.
*/
function extract_information_from_current_url(task) {

    ThisTask = JSON.parse(task)
    //var issue_num = get_issue_number(CURRENT_TAB_URL);
    var proj_slug = get_proj_slug("https://taiga.horwood.biz/project/matt-home-it/");
    var get_response_id = make_http_request("GET", api_url + "/projects/by_slug?slug=" + proj_slug, null, true, false, token);
    var proj_id = get_project_id(get_response_id);

    var issue_description = "Task# [" + ThisTask['taskId'] + "](https://crm.mayden.co.uk/tasks/"+ ThisTask['taskId'] +"/)\n\n" + ThisTask['body'];
    var issue_subject = ThisTask['title'];

    return { 'proj_id': proj_id, 'issue_subject': issue_subject, 'issue_description': issue_description };
}


function main(task){
    var extracted_information = extract_information_from_current_url(task);

    
    var new_us_id = promote_issue(user_stories_url,
                                  extracted_information['proj_id'],
                                  extracted_information['issue_subject'],
                                  extracted_information['issue_description'],
                                  token);

    //add_tasks(extracted_information['issue_description'], extracted_information['proj_id'], new_us_id, token);

    alert("User Story Complete");
}
