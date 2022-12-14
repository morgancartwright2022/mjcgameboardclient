const express = require('express')
const app = express()
const port = process.env.PORT || 4000;

app.use("/public", express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})