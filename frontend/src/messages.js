import {makeRequest} from './helpers.js';
import {userId, currentChannelId} from './helpers.js';
import { displayChannel } from './channels.js';

export function sendMessage(isImage) {
    let body = {};
    if (!isImage) {
        if (document.getElementById('message').value === "") return;
        body = {message: document.getElementById('message').value}
    } else {
        body = {image: document.getElementById('message').value,};
    }

    makeRequest('/message/' + currentChannelId(), 'POST', body).then(()=>{
        window.paginationNum = 0;
        document.querySelector('#send-image').value = null;
        displayChannel(currentChannelId());
    });
    document.getElementById('message').value = "";
}

export function displayMessage(text, messageId, isPinned, message) {
    const msg = document.getElementById('message-template-wrapper').cloneNode(true);
    msg.setAttribute('id', 'message-'+messageId);
    displayUserName(msg, message);

    if (isPinned) {
        msg.querySelector('#message-details').style.backgroundColor = "#EEDC82";
    } else {
        msg.querySelector('#message-details').style.backgroundColor = "#D3D3D3";
    }

    if (message.reacts.length != 0) {
        for (const react of message.reacts) {
            msg.querySelector(react['react']).classList.remove('grayed-out');
        }
    }

    // Show user profile when their name is clicked
    msg.querySelector('#message-user').addEventListener('click', ()=>{
        viewUserProfile(message);
    })

    if (message.message === undefined) {
        msg.querySelector('#message-image').src = message.image;
        const img = document.createElement('img');
        img.setAttribute('id', 'image-enlarge-'+message.id);
        img.src = message.image;
        img.style.width = "95%";
        document.querySelector('#modal-image-list').appendChild(img);
    } else {
        msg.querySelector('#message-body').innerText = text;
    }

    // Adding event listers to allow edit, delete, pin and unpin functions
    messageOtherActions(msg, message.id);

    // Adding event listeners to allow reacts and unreacts
    messageReactActions(msg, message);

    msg.style.display = 'inherit';
    document.getElementById('channel-messages-body').appendChild(msg);
    document.getElementById('channel-messages-body').appendChild(document.createElement('hr'));
}

function displayUserName(msgElement, message) {
    if (message.edited) {
        const editedAt = new Date(message.editedAt);
        const editedHoursMins = editedAt.getHours()+":"+ (editedAt.getMinutes() < 10 ? '0' : '') + editedAt.getMinutes(); 
        msgElement.querySelector('#message-time').innerText += "Edited at "+ editedAt.toDateString()+" "+editedHoursMins;
    } else {
        const dateTime = new Date(message.sentAt);
        const date = dateTime.toDateString();
        const time = dateTime.getHours()+":"+ (dateTime.getMinutes() < 10 ? '0' : '') + dateTime.getMinutes(); 
        msgElement.querySelector('#message-time').innerText += date+" "+time;
        msgElement.querySelector('#message-details').appendChild(document.createElement('br'));
    }

    makeRequest('/user/'+message.sender, 'GET').then((data)=>{
        msgElement.querySelector('#message-user').innerText = data.name;
        if (data.image === null) {
            msgElement.querySelector('.profile-image').src = "https://cplusc.com.au/wp-content/uploads/2022/05/blank-profile-picture-png.png";
        } else {
            msgElement.querySelector('.profile-image').src = data.image;
        }
    });
}

function viewUserProfile(message) {
    document.getElementById('channel-page').classList.add('hide');
    document.getElementById('view-user-profile').classList.remove('hide');
    window.currentPage = "View Profile";

    // Display Profile
    makeRequest('/user/'+message.sender, 'GET').then((data)=>{
        if (data.image === null) {
            document.getElementById('user-profile-image').src = "https://cplusc.com.au/wp-content/uploads/2022/05/blank-profile-picture-png.png";
        } else {
            document.getElementById('user-profile-image').src = data.image;
        }
        document.getElementById('user-profile-name').innerText ="Name: " + data.name;
        document.getElementById('user-profile-email').innerText ="Email: " + data.email;
        if (data.bio === null) {
            document.getElementById('user-profile-bio').innerText = "Bio:";
        } else {
            document.getElementById('user-profile-bio').innerText ="Bio: " + data.bio;
        }
    });

    // Add event listener to back button
    document.getElementById('back-channel').addEventListener('click', ()=>{
        document.getElementById('channel-page').classList.remove('hide');
        document.getElementById('view-user-profile').classList.add('hide');
        window.currentPage = "Channel";
    })
}

function messageOtherActions(msg, messageId) {
    msg.querySelector('.delete').addEventListener('click', ()=>{
        makeRequest('/message/'+currentChannelId()+'/'+ messageId, 'DELETE').then((data)=>{
            displayChannel(currentChannelId());
        });
    });

    msg.querySelector('.pin').addEventListener('click', ()=>{
        makeRequest('/message/pin/'+currentChannelId()+'/'+messageId, 'POST').then(()=>{
            displayChannel(currentChannelId());
        });
    });

    msg.querySelector('.unpin').addEventListener('click', ()=>{
        makeRequest('/message/unpin/'+currentChannelId()+'/'+messageId, 'POST').then(()=>{
            displayChannel(currentChannelId());
        });
    });

    msg.querySelector('.edit').addEventListener('click', ()=>{
        editMessage(messageId, msg);
        document.getElementById('edit-close-'+messageId).addEventListener("click", ()=>{
            document.getElementById('edit-div-'+messageId).style.display = "none";
            displayChannel(currentChannelId());
        });
    });
}


function messageReactActions(msg, message){
    const pop1 = initializePopover(".thumbs-up", msg, message);
    const pop2 = initializePopover(".heart", msg, message);
    const pop3 = initializePopover(".laugh", msg, message);
    const pop4 = initializePopover(".check", msg, message);

    // Reacts/unreacts
    msg.querySelector('.thumbs-up').addEventListener('click', ()=>{
        reactMessage('.thumbs-up', message);
        pop1.hide()
    });

    msg.querySelector('.heart').addEventListener('click', ()=>{
        reactMessage('.heart', message);
        pop2.hide()
    });

    msg.querySelector('.laugh').addEventListener('click', ()=>{
        reactMessage('.laugh', message);
        pop3.hide()
    });

    msg.querySelector('.check').addEventListener('click', ()=>{
        reactMessage('.check', message);
        pop4.hide()
    });
}

function initializePopover(reactType, msgDiv, message) {
    let reactors = "";
    for (const r of message.reacts) {
        if (r.react === reactType) {
            reactors += '\n' + r.user;
        }
    }
    var pop = new bootstrap.Popover(msgDiv.querySelector(reactType), {
        content: reactors,
        trigger: "hover",
        placement: "top",
    });
    return pop;
}

function reactMessage(reactClass, message) {
    if (alreadyReacted(message.reacts)) {
        makeRequest('/message/unreact/'+currentChannelId()+'/'+message.id, 'POST', {
            react: reactClass,
        }).then(()=>{
            displayChannel(currentChannelId());
        });
    } else {
        makeRequest('/message/react/'+currentChannelId()+'/'+message.id, 'POST', {
            react: reactClass,
        }).then(()=>{
            displayChannel(currentChannelId());
        });
    }
}

function alreadyReacted(reacts) {
    for (const react of reacts) {
        if (react.user === parseInt(userId())) {
            return true;
        }
    }
    return false;
}


function editMessage(messageId, msg) {
    const editDiv = document.createElement('div');
    editDiv.setAttribute('id', 'edit-div-'+messageId);

    const txt = document.createElement('textarea');
    txt.setAttribute('id', 'edit-'+messageId);
    const editSubmit = document.createElement('button');
    editSubmit.setAttribute('id', 'edit-submit-'+messageId);
    editSubmit.classList.add('btn');
    editSubmit.classList.add('btn-secondary');
    editSubmit.classList.add('btn-sm');
    editSubmit.innerText = "Edit Message";

    const editClose = document.createElement('button');
    editClose.setAttribute('id', 'edit-close-'+messageId)
    editClose.classList.add('btn');
    editClose.classList.add('btn-danger');
    editClose.classList.add('btn-sm');
    editClose.innerText = "Close";

    editDiv.appendChild(txt);
    editDiv.appendChild(editSubmit);
    editDiv.appendChild(editClose);
    
    if (msg.childNodes.length != 5) return;

    msg.appendChild(editDiv);


    document.getElementById('edit-submit-'+messageId).addEventListener('click', ()=>{
        const editVal = document.getElementById('edit-'+messageId).value;
        if (editVal === msg.querySelector('#message-body').innerText) {
            alert("No changes were made");
        }
        if (editVal != "") {
            makeRequest('/message/'+currentChannelId()+'/'+messageId, 'PUT',{
                message: document.getElementById('edit-'+messageId).value,
            }).then(()=>{
                displayChannel(currentChannelId());
            });
        }
    })
}