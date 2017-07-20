var TaigaApp = {
    SettingsPage: "options.html",
    TaigaUrl: "",
    TaigaUsername: "",
    TaigaPassword: "",
    populateStorage: function () {
        localStorage.setItem('TaigaUrl', '');
        localStorage.setItem('UserName', '');
        localStorage.setItem('Password', '');
        this.loadCredentials();
    },
    loadCredentials: function () {
        this.TaigaUrl = localStorage.getItem('TaigaUrl');
        this.TaigaUsername = localStorage.getItem('UserName');
        this.TaigaPassword = localStorage.getItem('Password');
    },
    saveCredentials: function () {
        localStorage.setItem('TaigaUrl', this.TaigaUrl);
        localStorage.setItem('UserName', this.ocusername);
        localStorage.setItem('Password', this.ocpassword);
    },
    auth: function () {
        var AuthToken = fetch("https://taiga.horwood.biz/index.php/api/v1/auth", {
            headers: {
                Authorization: 'basic '
                Content-Type: "application/json"
            }
        });
        AuthToken
            .then(response => {
                if (response.status !== 200) return Promise.reject(new Error('Failed to retrieve AuthToken from taiga'))
                else return response.json()
            })
            .then((json) => {
                if ('success' !== json.status) return Promise.reject(json.data)
                console.log(json)
                return json.data
            })
            .then(json => {
                for (i = 0; i < json.length; i++) {
                    bookmarkApp.saveBookmarkToCache(json[i], i);
                }
                localStorage.setItem('next_check', (Date.now() + 3600000));
                bookmarkApp.displayCache();
            });
    }
};