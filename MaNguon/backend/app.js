var express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  cors = require('cors'),
  path = require('path');

var userCtrl = require('./apiControllers/userController'),
  orderCtrl = require('./apiControllers/orderController'),
  requestCtrl = require('./apiControllers/requestReceiverController');

var verifyAccessToken = require('./repos/authRepo').verifyAccessToken;

var app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

var staticDir = express.static(path.resolve(__dirname, 'public'));
app.use(staticDir);

// app.get('/', (req, res) => {
// 	var ret = {
// 		msg: 'hello from nodejs api'
// 	};
// 	res.json(ret);
// });

app.use('/users', userCtrl);
app.use('/orders', verifyAccessToken, orderCtrl);
app.use('/requestReceiver', requestCtrl);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

const server = app.listen(3001, function() {
  console.log('server running on port 3001');
});

const io = require('socket.io')(server);

var axios = require('axios');
app.use(morgan('dev'));

io.on('connection', function(socket) {
  // console.log(socket.id);
  socket.on('SEND_MESSAGE', function(data) {
    axios
      .get('http://localhost:3000/requestReceiver')
      .then(res => {
        data = res.data;
        io.emit('MESSAGE', data);
      })
      .catch(err => {
        console.log(err);
      });
    // console.log(data);
  });

  // const array = ['1', '2', '3'];

  socket.on('ServerDriverOnline', function(data) {
    axios
      .get('http://localhost:3000/users/getDriverOnline')
      .then(res => {
        io.emit('ClientDriverOnline', res.data);
      })
      .catch(err => {
        console.log(err);
      });
  });

  socket.on('ServerDriverNhanDatXe', function(data) {
        io.emit('DriverNhanDatXe', data);
      });
});
