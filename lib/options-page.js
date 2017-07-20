/* global taigaApp */
//indexedDB.deleteDatabase('OCBookmarks');
//indexedDB.deleteDatabase('IDBBookmarks');

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
    },
    saveCredentials: function () {
        localStorage.setItem('taigaURL', this.taigaURL);
        localStorage.setItem('username', this.tusername);
        localStorage.setItem('password', this.tpassword);
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
    //document.getElementById('clear_db').onclick = taigaApp.clearDB();
}

init = function(){
    document.getElementById('submit').onclick = function(){
        taigaApp.taigaURL  = document.getElementById('taigaURL').value;
        taigaApp.tusername = document.getElementById('username').value;
        taigaApp.tpassword = document.getElementById('password').value;

        taigaApp.saveCredentials();
        taigaApp.loadCredentials();
        document.getElementById('taigaURL').value = taigaApp.taigaURL;
        document.getElementById('username').value = taigaApp.tusername;
        document.getElementById('password').value = taigaApp.tpassword;
        document.getElementById("upd_txt").innerHTML = 'Settings Updated';
        document.getElementById("upd_txt").className = 'bookmark_tag';
    };
};
window.addEventListener('load', init);