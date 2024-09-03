require('dotenv').config();

const fetch = require('node-fetch');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Status = require('./Status.js');

mongoose.connect(process.env.MONGO_CONN_STRING);
const db = mongoose.connection;

const apiKey = process.env.X_API_KEY;
const apiKeySecret = process.env.X_API_KEY_SECRET;
const accessToken = process.env.X_ACCESS_TOKEN;
const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

const oauth = new OAuth({
    consumer: { key: apiKey, secret: apiKeySecret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha1', key)
        .update(base_string)
        .digest('base64');
    },
});

async function getRandomStatus() {
    const statuses = await Status.find();
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return status.text;
}

async function post() {
    const url = 'https://api.twitter.com/2/tweets';

    const authorization = oauth.authorize(
        {
            url,
            method: 'POST'
        },
        {
            key: accessToken,
            secret: accessTokenSecret
        }
    );

    const headers = {
        Authorization: oauth.toHeader(authorization).Authorization,
        'Content-Type': 'application/json',
        'User-Agent': 'Malcom Bot'
    };

    const body = JSON.stringify({ text: await getRandomStatus() });

    let response = await fetch(url, { method: 'POST', headers, body });

    if (response.ok) {
        response = await response.json();
    }

    return response;
}

db.once('open', () => setInterval(() => post().then(response => console.log(response)), 1752000));