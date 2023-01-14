import { 
    fileToDataUrl, currentChannelId, toggleHide, makeRequest, userId
} from './helpers.js';

export function showProfile() {
    makeRequest('/user/'+ userId(), 'GET').then((data)=>{
        if (data.image === null) {
            document.getElementById('output').src = "https://cplusc.com.au/wp-content/uploads/2022/05/blank-profile-picture-png.png";
        } else {
            document.getElementById('output').src = data.image;
        }
        document.getElementById('profile-name').innerText = "Name: "+data.name;
        document.getElementById('profile-email').innerText = "Email: "+data.email;
    });
}

// TODO: Store name in sorted array
// Iterate names in sorted array and display

export function renderInviteUserModal() {
    const myNode = document.getElementById("user-list").textContent="";
    makeRequest('/user', 'GET').then((data)=>{
        for (const user of data.users) {
            makeRequest('/channel/'+currentChannelId(), 'GET').then((channel)=>{
                if (!channel['members'].includes(user.id) && user.id != userId()) {
                    makeRequest('/user/'+user.id, 'GET').then((userInfo)=>{
                        const list = document.createElement('li');
                        list.classList.add('list-group-item');
                        const label = document.createElement('label');
                        label.setAttribute('for', 'checkbox-'+user.id);
                        label.innerText = userInfo.name;
                        const input = document.createElement('input');
                        input.setAttribute('type', 'checkbox');
                        input.setAttribute('id', 'checkbox-'+user.id);
                        input.setAttribute('name', user.id);
                        list.appendChild(label);
                        list.appendChild(input);
                        document.getElementById('user-list').appendChild(list);
                    })
                }
            })
        }
    });
}

export function inviteUsersAction() {
    const usersList = document.getElementById('user-list').getElementsByTagName("li");
    for (const user of usersList) {
        const userInput = user.getElementsByTagName('input');
        for (const userI of userInput) {
            const userId = userI.id.split('-')[1];
            if (userI.checked) {
                makeRequest('/channel/'+currentChannelId()+'/invite', 'POST', {
                    userId: parseInt(userId),
                }).then(()=>{
                    renderInviteUserModal();
                    document.getElementById('invite-user-form').reset();
                });
            }
        }
    }
}
            
export function userChangePasswordAction() {
    // change password
    document.getElementById('change-password').addEventListener('click', ()=>{
        toggleHide(document.getElementById('new-password'));
        document.getElementById('new-password').reset();
    });

    document.querySelector('#toggle-password').addEventListener('click', () => {
        const password = document.getElementById('update-password');
        const password2 = document.getElementById('confirm-update-password');
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        const type2 = password2.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);    
        password2.setAttribute('type', type2);    
    });

    document.getElementById('submit-new-password').addEventListener('click', ()=>{
        const p1 = document.getElementById('update-password').value;
        const p2 = document.getElementById('confirm-update-password').value;
        if (p1 != p2) {
            alert("Passwords do not match!")
        } else if (p1 === p2) {
            makeRequest('/user', 'PUT', {
                password: p1,
            }).then(()=>{
                toggleHide(document.getElementById('new-password'));
                document.getElementById('new-password').reset();
                alert("Password has been changed")
            })
        }
    });
}

export function userEditProfileAction() {
    // Edit bio
    document.getElementById('edit-bio').addEventListener('click', ()=>{
        document.getElementById('editable-bio').readOnly = false;
        document.getElementById('editable-bio').focus();
        document.getElementById("update-bio-button").addEventListener('click', ()=>{
            makeRequest('/user', 'PUT', {
                bio: document.getElementById('editable-bio').value,
            }).then(()=>{
                document.getElementById('editable-bio').readOnly = true;
            })
        })
    });

    // Change user details
    document.getElementById('update-profile-button').addEventListener('click', ()=>{
        toggleHide(document.getElementById('update-profile-form'));
        document.getElementById('update-profile-form').reset();  
    })

    document.getElementById('submit-new-profile').addEventListener('click', ()=>{
        const form = document.getElementById('update-profile-form');
        if (form.name.value === "" && form.email.value === "") {
            alert("Please enter a new name or email")
        } else {
            const body = {
                name: form.name.value,
                email: form.email.value,
            }
            makeRequest('/user', 'PUT', body).then(()=>{
                toggleHide(document.getElementById('update-profile-form'));
                document.getElementById('update-profile-form').reset();
                alert("Details have been changed");
                showProfile();
            })
        }
    })
}

export function displayUserProfileScreen() {
    // profile button
    document.getElementById('profile-link').addEventListener('click', ()=>{
        // Entering from Dashboard 
        if (window.currentPage === "Dashboard") {
            document.getElementById('dashboard').classList.add('hide');
            document.getElementById('profile-section').classList.remove('hide');
        } else if (window.currentPage === "Channel") {
            document.getElementById('channel-page').classList.add('hide');
            document.getElementById('profile-section').classList.remove('hide');
        } else if (window.currentPage ==="View Profile") {
            document.getElementById('view-user-profile').classList.add('hide');
            document.getElementById('profile-section').classList.remove('hide');
        }
        window.currentPage = "Edit Profile";
        document.querySelector('#upload-profile-image').value = null;
        showProfile();
    });

    document.getElementById('back-dashboard').addEventListener('click', ()=>{
        document.getElementById('profile-section').classList.add('hide');
        document.getElementById('dashboard').classList.remove('hide');
        window.currentPage = "Dashboard";
    });

    window.addEventListener('load', function() {
        document.querySelector('#upload-profile-image').addEventListener('change', function() {
            if (this.files && this.files[0]) {
                fileToDataUrl(this.files[0]).then((data)=>{
                    makeRequest('/user', 'PUT', {
                        image: data,
                    }).then(()=>{
                        document.getElementById('output').src = data; 
                    });
                })
            }
        });
    });
}