/* global taigaApp */
//indexedDB.deleteDatabase('OCBookmarks');
//indexedDB.deleteDatabase('IDBBookmarks');

var taigaApp = {
    settings_page: "options.html",
    taigaURL: "",
    tusername: "",
    tpassword: "",
    project: "",
    auth_token: "",
    populateStorage: function () {
        localStorage.setItem('taigaURL', '');
        localStorage.setItem('username', '');
        localStorage.setItem('password', '');
        localStorage.setItem('project', '');
        localStorage.setItem('token', '');
        this.loadCredentials();
    },
    loadCredentials: function () {
        this.taigaURL = localStorage.getItem('taigaURL');
        this.tusername = localStorage.getItem('username');
        this.tpassword = localStorage.getItem('password');
        this.tproject = localStorage.getItem('project');
        this.auth_token = localStorage.getItem('token');
    },
    saveCredentials: function () {
        localStorage.setItem('taigaURL', this.taigaURL);
        localStorage.setItem('username', this.tusername);
        localStorage.setItem('password', this.tpassword);
        localStorage.setItem('project', this.tproject);
    }
}

/*options*/
if(!localStorage.getItem('taigaURL')) {
    taigaApp.populateStorage();
} else {
    taigaApp.loadCredentials();
    document.getElementById('taigaURL').value = taigaApp.taigaURL;
    document.getElementById('username').value = taigaApp.tusername;
    document.getElementById('password').value = taigaApp.tpassword;
    document.getElementById('project').value = taigaApp.tproject;
    document.getElementById('token').value = taigaApp.auth_token;
}

init = function(){
    document.getElementById('submit').onclick = function(){
        taigaApp.taigaURL  = document.getElementById('taigaURL').value;
        taigaApp.tusername = document.getElementById('username').value;
        taigaApp.tpassword = document.getElementById('password').value;
        taigaApp.tproject = document.getElementById('project').value;

        taigaApp.saveCredentials();
        taigaApp.loadCredentials();
        document.getElementById('taigaURL').value = taigaApp.taigaURL;
        document.getElementById('username').value = taigaApp.tusername;
        document.getElementById('password').value = taigaApp.tpassword;
        document.getElementById('token').value = taigaApp.auth_token;
        
        if(taigaApp.taigaURL != ""){
            var auth_req = new XMLHttpRequest();
            auth_req.open("POST", taigaApp.taigaURL + "/api/v1/auth", false);
            auth_req.setRequestHeader('Content-Type', 'application/json');
            //auth_req.setRequestHeader('Authorization', 'Bearer ' + auth_token);
            var request_data = JSON.stringify({"password": taigaApp.tpassword, "type": "normal", "username": taigaApp.tusername});
            auth_req.send(request_data);
            auth_token = JSON.parse(auth_req.responseText);
            if(auth_req.status != 200){
                alert("Login to Taiga (taigaApp.taigaURL) failed, please check your login!");
                document.getElementById("upd_txt").innerHTML = "Login to Taiga (taigaApp.taigaURL) failed, please check your login!";
                document.getElementById("upd_txt").className = 'errors';
            }else{
                document.getElementById("upd_txt").innerHTML = 'Settings Updated';
                document.getElementById("upd_txt").className = 'bookmark_tag';
                localStorage.setItem('token', auth_token.auth_token);
                taigaApp.auth_token = auth_token.auth_token;
            }
        }
    };
};
window.addEventListener('load', init);