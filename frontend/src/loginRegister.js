import {
    makeRequest, setToken, setUserId,  switchLoginForm, changeLoggedInPage, 
    changeLoggedoutPage, formIsEmpty
} from './helpers.js';
import {getAllChannels} from './channels.js';

export function registerAccountAction() {
    const registerForm = document.getElementById("register-form");
    if (registerForm["password1"].value != registerForm["password2"].value) {
        alert("Passwords do not match!")
    } else {
        if(formIsEmpty(registerForm)) return;
        const data = makeRequest('/auth/register', 'POST', { 
            name: registerForm["name"].value,
            email: registerForm["email"].value,
            password: registerForm["password1"].value
        }).then((data)=>{
            setToken(data.token);
            setUserId(data.userId);
            switchLoginForm();
        });
    }
}

export function logInAction() {
    const data = makeRequest('/auth/login', 'POST', {
        email: document.getElementById("login-form")["email"].value,
        password: document.getElementById("login-form")["password"].value
    }).then((data)=>{
        setToken(data.token);
        setUserId(data.userId);
        getAllChannels();
        changeLoggedInPage();
    });
}

export function logOutAction(logOutButton) {
    makeRequest('/auth/logout', 'POST', {})
    .then((data)=>{
        changeLoggedoutPage();
        setToken(null);
        setUserId(null);
    });
}



