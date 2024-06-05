// j'importe le package HTTP de Node
const http = require("http");
// j'importe l'application Express
const app = require("./app");

// normalizePort renvoie un port valide qu'il soit un numéro ou une chaîne
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || "8080");
app.set("port", port);

// errorHandler recherche les erreurs et les gère de manière appropriée puis les enregistres dans le serveur
const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// je créé un serveur en utilisant l'Http auquel je rattache l'app Express
const server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe" + address : "port " + port;
  console.log("listening on " + bind);
});

// ecouter les requetes envoyées
server.listen(port);