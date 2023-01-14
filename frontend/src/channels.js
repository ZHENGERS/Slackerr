import {makeRequest} from './helpers.js';
import {userId, setCurrChannelId, currentChannelId, formIsEmpty, toggleHide} from './helpers.js';
import {displayMessage} from './messages.js';

window.paginationNum = 0;

export function createChannel() {
    const form = document.getElementById('create-channel-form');

    if (formIsEmpty(form)) return;
    
    const data = makeRequest('/channel', 'POST', {
        name: form["name"].value,
        private: form['public-private'].value === 'private',
        description: form['description'].value,
    }).then((data)=>{
        toggleHide(document.getElementById('create-channel'));
        getAllChannels();
        form.reset();
    });
}

export function updateChannel() {
    const updateForm = document.getElementById('update-channel-form');
    makeRequest('/channel/'+currentChannelId(), 'PUT', {
        name: updateForm['name'].value,
        description: updateForm['description'].value,
    }).then((data)=>{
        displayChannel(currentChannelId());
        getAllChannels();
        updateForm.reset();
    });
}

export function getAllChannels() {
    makeRequest('/channel', 'GET').then((data)=>{
        document.getElementById('public-channels').innerText = "";
        document.getElementById('private-channels').innerText = "";

        for (const channel of data.channels) {
            if (!channel['private']) {
                showChannelList('public-channels', channel);
            } 
            else if (channel['members'].includes(parseInt(userId()))) {
                showChannelList('private-channels', channel);
            }
        }
    });
}

export function displayChannel(id) {
    makeRequest('/channel/' + id, 'GET').then((data)=>{     
        showChannelDetails(data);

        // Clear image
        let imageList = document.getElementById('modal-image-list');
        while( imageList.firstChild ){
            imageList.removeChild( imageList.firstChild );
        }

        // Remove message body and create new one (update the messages without repeating)
        // More elegant way to do this????
        document.getElementById('channel-messages-body').remove();
        const channelMsgBody = document.createElement('div');
        channelMsgBody.setAttribute('id', 'channel-messages-body');
        document.getElementById('channel-messages').appendChild(channelMsgBody);
        let start = window.paginationNum * 10;
        makeRequest('/message/' + id + '?start='+start, 'GET').then((data)=>{
            data.messages.sort((a, b)=>{
                if (a.pinned === b.pinned) {
                    return 0;
                } 
                if (!a.pinned && b.pinned) {
                    return 1;
                }
                if (a.pinned && !b.pinned) {
                    return -1;
                }
            });
            const paginatedMessages = data.messages.slice(0, 10);
            for (const message of paginatedMessages) {
                displayMessage(message.message, message.id, message.pinned, message);
            }
            document.getElementById('page-num').innerText = 'Page ' + (window.paginationNum+1);
            if (data.messages.length <= 10) {
                document.getElementById('next-button').style.display = 'none'
            } else {
                document.getElementById('next-button').style.display = 'inherit';
            }
            if (window.paginationNum === 0) {
                document.getElementById('previous-button').style.display = 'none';
            } else {
                document.getElementById('previous-button').style.display = 'inherit';
            }
        });
    }).catch(() => {
        document.getElementById('channel-details').classList.add('hide');

        var myModal = new bootstrap.Modal(document.getElementById('join-channel-modal'), {
            keyboard: false
        })
        myModal.show();
        document.getElementById('join-channel-modal').classList.add('show')


        // document.getElementById('channel-join-button').addEventListener('click', ()=>{
        //     makeRequest('/channel/'+id+'/join', 'POST');
        //     displayChannel(id);
        //     myModal.hide();
        // })

        // makeRequest('/channel/'+id+'/join', 'POST');
        // displayChannel(id);       
    }); 
    setCurrChannelId(id);
}

export function leaveChannelAction () {
    makeRequest('/channel/'+ currentChannelId() +'/leave', 'POST').then((data)=>{
        document.getElementById('dashboard').classList.remove('hide'); 
        document.getElementById('channel-page').classList.add('hide'); 
        window.currentPage = "Dashboard";
        getAllChannels();
    });
}

function showChannelList(publicOrPrivate, channel) {
    const link = document.createElement('a');
    link.classList.add('list-group-item');
    link.classList.add('list-group-item-action');
    if (publicOrPrivate === 'public-channels') {
        link.classList.add('list-group-item-primary');
    } else {
        link.classList.add('list-group-item-warning');
    }
    link.innerText = channel.name;
    link.setAttribute('id', channel.id);
    link.addEventListener('click', ()=>{
        // set pagination to 1
        window.paginationNum = 0;
        window.currentPage = "Channel";
        displayChannel(channel.id);
    });
    document.getElementById(publicOrPrivate).appendChild(link);
}

function showChannelDetails(data) {
    document.getElementById('channel-name').innerText = "Welcome to " + data.name + "!";
    document.getElementById('channel-description').innerText = data.description;
    document.getElementById('channel-time').innerText = (new Date(data.createdAt));
    document.getElementById('channel-private').innerText = (data.private ? 'Private' : 'Public');

    // Manipulate dom elements
    document.getElementById('dashboard').classList.add('hide'); 
    document.getElementById('channel-page').classList.remove('hide'); 
    document.getElementById('channel-details').classList.remove('hide');
}

