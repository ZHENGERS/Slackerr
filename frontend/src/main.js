import { BACKEND_PORT } from './config.js';
import { 
    setToken, setUserId, currentChannelId, setCurrChannelId, switchLoginForm, 
    switchRegisterForm, changeDashboardPage, toggleHide, fileToDataUrl, makeRequest
} from './helpers.js';
import {logOutAction, logInAction, registerAccountAction} from './loginRegister.js';
import {
    createChannel, leaveChannelAction, updateChannel, displayChannel
} from './channels.js';
import {sendMessage} from './messages.js';
import {renderInviteUserModal, inviteUsersAction, userChangePasswordAction, 
    userEditProfileAction, displayUserProfileScreen
} from './user.js';

window.currentPage = null;

function main() {
    
    setToken(null);
    setUserId(null);
    setCurrChannelId(null);

    // Switch between register and log-in form
    document.getElementById("register-link").addEventListener('click', switchRegisterForm);
    document.getElementById("login-link").addEventListener('click', switchLoginForm);

    // Log-in and register account
    document.getElementById('login-button').addEventListener('click',logInAction);
    document.getElementById('register-button').addEventListener('click', registerAccountAction);

    // Log-out of account
    document.getElementById('logout-link').addEventListener('click', logOutAction);

    // Create new channel
    document.getElementById('create-channel-button').addEventListener('click', ()=>{
        toggleHide(document.getElementById('create-channel'));
    });
    document.getElementById('create-channel-submit').addEventListener('click', createChannel);

    // Back button
    document.getElementById('back-button').addEventListener('click', changeDashboardPage);

    // Send message (text)
    document.getElementById('send-message').addEventListener('click', ()=>{
        if (document.getElementById('message').value.includes("data:image")) {
            sendMessage(true);
        } else {
            sendMessage(false);
        }
    });

    // Send image
    window.addEventListener('load', function() {
        document.querySelector('#send-image').addEventListener('change', function() {
            fileToDataUrl(this.files[0]).then((data)=>{
                document.getElementById('message').value = data;
            });

        });
    });

    document.getElementById('channel-join-button').addEventListener('click', ()=>{
        makeRequest('/channel/'+currentChannelId()+'/join', 'POST');
        displayChannel(currentChannelId());
        document.getElementById('join-channel-modal').classList.remove('show');
    })

    // Leave Channel
    document.getElementById('leave-channel-button').addEventListener('click', leaveChannelAction)

    // Update channel details
    document.getElementById('update-channel-button').addEventListener('click', ()=>{
        toggleHide(document.getElementById('update-channel-form'));
        document.getElementById('update-channel').addEventListener('click', updateChannel);
    })

    // Pagination next
    document.getElementById('next-button').addEventListener('click', ()=>{
        window.paginationNum += 1;
        displayChannel(currentChannelId());
    })

    // Pagination prev
    document.getElementById('previous-button').addEventListener('click', ()=>{
        window.paginationNum -= 1;
        displayChannel(currentChannelId());
    })

    // invite users
    document.getElementById('invite-users-btn').addEventListener('click', () => {
        renderInviteUserModal()
    })

    document.getElementById('invite-users-action').addEventListener('click', inviteUsersAction)

    userChangePasswordAction();

    userEditProfileAction();

    displayUserProfileScreen(); 
}


main();


