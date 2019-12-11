require('dotenv').config()
const request = require('request');
const express = require('express')
const bodyParser = require("body-parser");
const path = require('path')
const PORT = process.env.PORT || 5000

const {
  Pool
} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// Module imports
const {
  maps_api_post,
  getMinutesSince,
  log_to_db,
  get_mins_since_last_entry,
  lookup_coords_and_log,
  log_request_if_interval_expired
} = require('./helpers');

var moment = require('moment');

const info_log = '[INFO] ' + moment().format()

// Express Setup
express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({
    extended: false
  }))
  .set('views', path.join(__dirname, 'views'))
  // Templating engine
  .set('view engine', 'ejs')

  // Routes
  .get('/', (req, res) => res.render('pages/index'))
  // Incoming requests via this route 
  .post('/', async (req, res) => {
    try {
      console.log(`${info_log} - New incoming event: ${req.body.event_type.description}`)
      // Event Source = Network for the LAC & CID etc.
      if (req.body.event_source && req.body.event_source.name == 'Network') {
        // If there's a PDP Context object in the Request Body
        if (req.body.detail.pdp_context) {
          // Specify a time interval 
          const interval = 5
          // Connect to DB
          const client = await pool.connect()
          // If no entry in last time interval, log to DB
          log_request_if_interval_expired (client, interval, req)          
          // Disconnect from DB whether DB entry or not
          client.release();
        }
      }
      res.status(200).send({
        "Looks good": true
      })
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  // Just show a table
  .get('/table', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM coords_table');
      const results = {
        'results': (result) ? result.rows : null
      };
      res.render('pages/table', results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  // Show our proper map
  .get('/map', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM coords_table');
      const results = {
        'results': (result) ? result.rows : null
      };
      res.render('pages/map', results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .listen(PORT, () => {
    console.log(`Server running on port ${PORT} (For localhost, see http://127.0.0.1:${PORT})`)
  })