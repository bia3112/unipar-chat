var stompClient = null;
var username = null;

document.getElementById("welcome-form").style.display = "block";

function enterChatRoom() {
    username = document.getElementById("username").value.trim();
    if(username) {
        document.getElementById("welcome-form").style.display = "none";
        document.getElementById("chat-room").style.display = "block";
        connect();    
    } else {
        alert("Por favor, insira um nickname!");
    }
        
}

function sendMessage() {
    var messageContent = document.getElementById("messageInput").value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };
        stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
        document.getElementById("messageInput").value = '';
    }
}

function connect() {
    var socket = new SockJS('https://0aa5d393a7ff.ngrok.app/chat-websocket', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log('Conectado: ' + frame);
        stompClient.subscribe('/topic/public', function (messageOutput) {
            showMessage(JSON.parse(messageOutput.body));
        });

        stompClient.send("/app/addUser", {}, JSON.stringify({ 
            sender: username, type: 'JOIN' }));
    });
}


function showMessage(message) {
    var messageElement = document.createElement('div');
    if(message.type === 'JOIN') {
        messageElement.innerText = message.sender + " entrou na sala.";
    } else if(message.type === 'LEAVE'){
        messageElement.innerText = message.sender + " saiu da sala.";
    } else {
        messageElement.innerText = message.sender + " disse: " + message.content;
    }

    document.getElementById("message").appendChild(messageElement);
}


function leaveChat() {
    if (stompClient) {
        var chatMessage = {
            sender: username,
            type: 'LEAVE'
        };
        stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));

        stompClient.disconnect(function() {
            console.log('Desconectado da sala');
        document.getElementById("welcome-form").style.display = "block";
        document.getElementById("chat-room").style.display = "none";
        });
    }
}
