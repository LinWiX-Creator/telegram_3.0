const socket = io("http://localhost:3000");

let username = "";

function join() {
  username = document.getElementById("name").value;
  socket.emit("join", username);
}

socket.on("receive_message", (data) => {
  const div = document.getElementById("messages");
  div.innerHTML += `<p><b>${data.user}:</b> ${data.message}</p>`;
});

function send() {
  const msg = document.getElementById("msg").value;
  socket.emit("send_message", msg);
}
