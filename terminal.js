const input = document.getElementById("input");
const output = document.getElementById("output");

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const command = input.value.trim();
    const line = document.createElement("div");
    line.textContent = "$ " + command;
    output.appendChild(line);

    handleCommand(command);

    input.value = "";
    window.scrollTo(0, document.body.scrollHeight);
  }
});

let socket = null;

function handleCommand(cmd) {
  const response = document.createElement("div");

  if (cmd.startsWith("nc ")) {
    const parts = cmd.split(" ");
    if (parts.length !== 3) {
      response.textContent = "Usage: nc [host] [port]";
    } else {
      const host = parts[1];
      const port = parts[2];
      const wsUrl = `ws://${host}:${port}`;

      try {
        socket = new WebSocket(wsUrl);
        socket.onopen = () => appendOutput(`Connected to ${wsUrl}`);
        socket.onmessage = (e) => appendOutput(`← ${e.data}`);
        socket.onerror = (e) => appendOutput(`WebSocket error`);
        socket.onclose = () => appendOutput(`Connection closed`);
      } catch (e) {
        appendOutput("WebSocket connection failed");
      }
    }
  } else if (cmd.startsWith("send ") && socket && socket.readyState === WebSocket.OPEN) {
    const msg = cmd.slice(5);
    socket.send(msg);
    appendOutput(`→ ${msg}`);
  } else if (cmd === "close" && socket) {
    socket.close();
    socket = null;
    appendOutput("Connection closed");
  } else {
    // 既存のコマンドたち
    switch (cmd) {
      case "help":
        response.textContent = "Available: help, echo, date, clear, nc [host] [port], send [msg], close";
        break;
      case "date":
        response.textContent = new Date().toString();
        break;
      case "clear":
        output.innerHTML = "";
        return;
      default:
        if (cmd.startsWith("echo ")) {
          response.textContent = cmd.slice(5);
        } else {
          response.textContent = "Command not found: " + cmd;
        }
    }
    output.appendChild(response);
  }
}

function appendOutput(text) {
  const div = document.createElement("div");
  div.textContent = text;
  output.appendChild(div);
}
