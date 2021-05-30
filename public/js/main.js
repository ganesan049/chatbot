const charForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const leaveBtn = document.getElementById('leave-btn');
const roomName = document.getElementById('room-name')
const usersList = document.getElementById('users')

//Get username and room
const {username,room} = Qs.parse(location.search,{
  ignoreQueryPrefix:true
});

console.log(roomName,usersList)
console.log(username+" "+room)

const socket = io();

leaveBtn.addEventListener('click',(e) => {
  const leaveRoom = confirm('are you sure want to leave?');
  console.log(leaveRoom)
  if(leaveRoom){
    window.location ='../index.html';
  }
})

socket.emit('joinRoom',{username,room})

socket.on('roomUsers',({room,users}) => {
  outputRoomName(room)
  outputUsersName(users)
});

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsersName(users) {
  console.log(users)
  usersList.innerHTML = `<li>You</li>
  ${users.map(user => {
    return user.username == username?null:`<li>${user.username}</li>`
  })
  .join('')}
  `;
}

socket.on('message',objMessage => {
  console.log(objMessage);
  // let [username,message,time] = [objMessage.username,objMessage.message,objMessage.time];
  outputMessage(objMessage);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

charForm.addEventListener('submit',(e) => {
  e.preventDefault();
  
  const message = e.target.elements.msg.value;
  console.log(message+" Message")
  
  // emitting the message to server
  socket.emit('chatMessage',message);

  //clear text
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
})

function outputMessage(objMessage) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML =  `<p class="meta">${objMessage.username} : <span>${objMessage.time}</span></p>
  <p class="text">${objMessage.message}</p>`; 
  document.querySelector('.chat-messages').appendChild(div);
}