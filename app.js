const path = require('path');
const express = require('express');
const bodyparser = require('body-parser');

const PORT = 8080;
const app = express();

const mainRoute = require('./routes/index');
const userRoute = require('./routes/users');
const loginRoute = require('./routes/login');
const signInRoute = require('./routes/signIn');
const galleryRoute = require('./routes/gallery');
const imagesRoute = require('./routes/images');

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.use(express.static('public'))

app.use(mainRoute);
app.use(userRoute);
app.use('/api/', loginRoute);
app.use('/api/', signInRoute.router);
// app.use(galleryRoute);
app.use(imagesRoute);

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', '404.html'))
})

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log('Server running on http://localhost:' + PORT);
})