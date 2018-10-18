const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const PORT = 8080;
const app = express();
const server = require('http').createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/spotify', function(req, res, next){
  const q = req.query && req.query.q || '';

  sendSpotifyRequest(`/search?type=artist&limit=50&q=${q}`)
    .then(response => {
      res.send(response);
    })
    .catch(next);
});

app.use(express.static(__dirname));

server.listen(PORT);
console.log(`Server is running on http://localhost:${PORT} ...`);


function sendSpotifyRequest(requestUrl) {
  return new Promise((resolve, reject) => {
    const auth = 'Basic ' + Buffer.from('748e652cffb540178d55b89c608c2c3c:54ddf104000c4c11928df4997528772e', 'utf-8').toString('base64');
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': auth
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true
    };

    request.post(authOptions, (error, response, body) => {
      if (error) {
        reject(error);
        return;
      }

      if (response.statusCode >= 300) {
        reject(response);
        return;
      }

      const token = body.access_token;
      const options = {
        url: `https://api.spotify.com/v1${requestUrl}`,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.statusCode >= 300) {
          reject(response);
          return;
        }

        resolve(body);
      });

    });
  });
}
