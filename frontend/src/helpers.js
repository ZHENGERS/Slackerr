/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
*/

export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

export function switchRegisterForm() {
    document.getElementById("register-container").classList.remove('hide');
    document.getElementById("login-container").classList.add('hide');
    document.getElementById("login-form").reset()
}

export function switchLoginForm() {
    document.getElementById("register-container").classList.add('hide');
    document.getElementById("login-container").classList.remove('hide');
    document.getElementById("register-form").reset()
}

export function changeDashboardPage() {
    document.getElementById('dashboard').classList.remove('hide'); 
    document.getElementById('channel-page').classList.add('hide'); 
    window.currentPage = "Dashboard";
}

export function changeLoggedoutPage() {
    document.getElementById('logged-in').classList.add('hide');
    document.getElementById("login-container").classList.remove('hide');
    document.getElementById("view-user-profile").classList.add('hide');
    document.getElementById("profile-section").classList.add('hide');
    document.getElementById("profile-link").style.display = "none";    
    document.getElementById("logout-link").style.display = "none";    
    window.currentPage = null;
}

export function changeLoggedInPage() {
    document.getElementById("login-container").classList.add('hide');
    document.getElementById('logged-in').classList.remove('hide');
    document.getElementById("login-form").reset();
    changeDashboardPage();
    document.getElementById("profile-link").style.display = "inherit"; 
    document.getElementById("logout-link").style.display = "inherit";
    window.currentPage = "Dashboard"
}


export function toggleHide(element) {
    if (element.classList.contains('hide')) {
        element.classList.remove('hide');
    } else {
        element.classList.add('hide');
    }
}

export function formIsEmpty(form) {
    for (const element of form.elements) {
        if(element.hasAttribute("required") && element.value === "") {
            return true;
        }
    }
    return false;
}

export const makeRequest = (route, method, body) => {
    const baseParams = {
        method: method,
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + token(),
        },
    };
    if (body !== undefined) {
        baseParams.body =  JSON.stringify(body);   
    }
    return new Promise((resolve, reject)=>{
        fetch('http://localhost:5005'+route, baseParams).then((rawResponse)=>{
            return rawResponse.json();
        }).then((data)=>{
            if (data.error) {
                alert(data.error);
                reject(new Error(data.error));
            } else {
                resolve(data);
            }
        });
    }); 
}

export const setToken = (token) => window.localStorage.setItem('token', token);
export const token = () => window.localStorage.getItem('token');

export const setUserId = (userId) => window.localStorage.setItem('userId', userId);
export const userId = () => window.localStorage.getItem('userId');

export const setCurrChannelId = (currentChannelId) => window.localStorage.setItem('currentChannelId', currentChannelId);
export const currentChannelId = () => window.localStorage.getItem('currentChannelId');
