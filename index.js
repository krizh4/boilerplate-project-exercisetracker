const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// CODE BY KRIZH4 from here

// basic configurations
mongoose.connect(process.env.MONGO_URI, );
// body parsing
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//DB Schema
let UserObject;
let ExerciseObject
const Schema = mongoose.Schema;


const exerciseObjectSchema = new Schema({
  description: {type: String},
  duration: {type: Number},
  date: {type: String},
});

const userObjectSchema = new Schema({
  username: {type: String, required: true},
  count: {type: Number},
  log: [exerciseObjectSchema],
});

UserObject = mongoose.model('ExersiseTrackerUsers', userObjectSchema);

app.get('/api/users', async (req, res) => {
  var a = await UserObject.find();
  res.json(a);
}).post('/api/users', (req, res) => {
  UserObject({
    username: req.body.username
  }).save((err, data) => {
    if (err) return res.send(err.toString())
    res.json({
      _id: data._id,
      username: data.username
    });
  });
});

app.post('/api/users/:id/exercises', (req, res) => {
  UserObject.findById({_id: req.params.id}, (err, user) => {
    if (err) console.log(err);
    var idate = req.body.date || new Date().getTime();
    user.log.push({
      description: req.body.description,
      duration: req.body.duration,
      date: new Date(idate).toDateString(),
    });
    user.save((err, data) => {
      if (err) return console.log(err);
      res.json({
        _id: data._id,
        username: data.username,
        date: data.log[data.log.length - 1].date,
        duration: data.log[data.log.length - 1].duration,
        description: data.log[data.log.length - 1].description
      });
    });
  });
});

app.get('/api/users/:id/logs', (req, res) => {
  var from = req.query.from;
  var to = req.query.to;
  var limit = req.query.limit;

  UserObject.findById({_id: req.params.id}, (err, user) => {
    if (err) return console.log(err);
    user.log.sort((a,b) => new Date(b.date) - new Date(a.date));
    user.log = (from) ? user.log.filter((item) => new Date(item.date) >= new Date(from)) : user.log;
    user.log = (to) ? user.log.filter((item) => new Date(item.date) <= new Date(to)) : user.log;
    user.log = (limit) ? user.log.slice(0, limit) : user.log;

    res.json({
      _id: user._id,
      username: user.username,
      count: user.log.length,
      log: user.log
    });
  });
})

// CODE BY KRIZH4 to here

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
  console.log('visit your app: ' + 'http://localhost:' + listener.address().port);
})
