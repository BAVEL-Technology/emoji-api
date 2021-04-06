const express = require('express');
const PORT = process.env.PORT || 5000;
const path = require('path');
const cors = require('cors');
const routes = require('./routes');
const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
   res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});


const start = () => {
  const server = app.listen(PORT, function() {
    console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
  });
}

start()
