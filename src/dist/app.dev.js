"use strict";

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _expressValidator = require("express-validator");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config();

var _process$env$PORT = process.env.PORT,
    port = _process$env$PORT === void 0 ? 3000 : _process$env$PORT;
var app = (0, _express["default"])(); // TODO setja upp rest af virkni!

app.use(_express["default"]["static"]('public'));
app.set('/views', 'views');
app.set('view engine', 'ejs');
app.use(_express["default"].urlencoded({
  extended: true
}));
app.get('/', function _callee(req, res) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          //const result = await query('SELECT * FROM signatures');
          res.render('skraning');

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
});
app.post('/post', (0, _expressValidator.body)('nafn').isLength({
  min: 1
}).withMessage('Nafn má ekki vera tómt'), (0, _expressValidator.body)('nafn').isLength({
  max: 128
}).withMessage('Nafn má að hámarki vera 128 stafir'), (0, _expressValidator.body)('kt').isEmpty().withMessage('Kennitala má ekki vera tóm'), (0, _expressValidator.body)('kt').isLength({
  min: 10,
  max: 11
}).withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'), (0, _expressValidator.body)('ath').isLength({
  max: 400
}).withMessage('Athugasemd má að hámarki vera 400 stafir'), function (req, res) {
  var errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    var errorMessages = errors.array().map(function (i) {
      return i.msg;
    });
    var errJoin = errorMessages.join('</li><li>');
    res.redirect('skraning', {
      errJoin: errJoin
    });
  }
}, (0, _expressValidator.body)('name').trim().escape(), (0, _expressValidator.body)('kt').blacklist('-'), (0, _expressValidator.body)('ath').escape(), req); // Verðum að setja bara *port* svo virki á heroku

app.listen(port, function () {
  console.info("Server running at http://localhost:".concat(port, "/"));
});