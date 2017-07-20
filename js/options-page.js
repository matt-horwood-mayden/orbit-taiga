/* global TaigaApp */

/*options*/
if(!localStorage.getItem('TaigaUrl')) {
    TaigaApp.populateStorage();
} else {
    TaigaApp.loadCredentials();
    document.getElementById('TaigaUrl').value = TaigaApp.TaigaUrl;
    document.getElementById('UserName').value = TaigaApp.TaigaUsername;
    document.getElementById('Password').value = TaigaApp.TaigaPassword;
}

init = function(){
    document.getElementById('submit').onclick = function(){
        TaigaApp.TaigaUrl      = document.getElementById('TaigaUrl').value;
        TaigaApp.TaigaUsername = document.getElementById('UserName').value;
        TaigaApp.TaigaPassword = document.getElementById('Password').value;

        TaigaApp.saveCredentials();
        TaigaApp.loadCredentials();
        document.getElementById('TaigaUrl').value = TaigaApp.TaigaUrl;
        document.getElementById('UserName').value = TaigaApp.TaigaUsername;
        document.getElementById('Password').value = TaigaApp.TaigaPassword;
        document.getElementById("upd_txt").innerHTML = 'Settings Updated';
        document.getElementById("upd_txt").className = 'bookmark_tag';
    };
};
window.addEventListener('load', init);