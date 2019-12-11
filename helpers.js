const request = require('request');
var moment = require('moment');

const info_log = '[INFO] ' + moment().format()

// Get number minutes difference between two timestamps
function getMinutesSince(timestamp2) {
  const timestamp1 = moment()
  // See moment.js for setting minutes to hours, etc.
  const minutesDifference = timestamp1.diff(timestamp2, 'minutes')
  return minutesDifference;
}

// Lookup of last entry for this endpoint
// Return the minutes since the last DB entry for this endpoint
// or null if no entry for this endpoint ID
async function get_mins_since_last_entry(endpoint_id, client) {
  const latest_event = await client.query(
    `SELECT * FROM coords_table WHERE endpoint_id = ${endpoint_id} ORDER BY ID DESC LIMIT 1;`, (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      if (typeof latest_event != "undefined") {
        const latest_row = latest_event.rows[0]
        if (typeof latest_row != "undefined") {
          var mins_since_last_entry = getMinutesSince(latest_row.timestamp)
        } else {
          mins_since_last_entry = null
        }
        console.log(res.rows[0])
      }
    }
    return mins_since_last_entry
  })
}

// Make a POST request to Google Maps
function maps_api_post(pdp_context) {
  return new Promise(resolve => {
    // Construct a JSON Payload
    const geolocation_payload = {
      "cellTowers": [{
        "cellId": pdp_context.ci,
        "locationAreaCode": pdp_context.lac,
        "mobileCountryCode": pdp_context.mcc,
        "mobileNetworkCode": pdp_context.mnc
      }]
    }
    request.post(`https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.API_KEY}`, {
      json: geolocation_payload

    }, (error, res, body) => {
      if (error) {
        console.error(error)
        return
      }
      if (res.statusCode == 200) {
        resolve(body)
      }
    })

  })
}

// Chain the MAPS API lookup and DB entry calls
function lookup_coords_and_log(client, pdp_context, endpoint_id, endpoint_name) {
  maps_api_post(pdp_context).then(function(coords) {
    log_to_db(client, endpoint_id, endpoint_name, coords.location.lat, coords.location.lng, coords.accuracy)
  })
}

// Add a new DB entry
async function log_to_db(client, endpoint_id, endpoint_name, lat, long, accuracy) {
  console.log(`${info_log} - Adding new DB entry for ${endpoint_id}`)
  const timestamp = moment().format()
  const result = await client.query(
    'INSERT INTO coords_table (timestamp, endpoint_id, endpoint_name, lat, long, accuracy) ' +
    'VALUES ($1, $2, $3, $4, $5, $6)',
    [timestamp, endpoint_id, endpoint_name, lat, long, accuracy],
    (error, results) => {
      if (error) {
        throw error
      }
      return true
    })
}

// Basic timing check. Set a minute-based interval,
// Will only log new entries if they occur more than certain number of minutes in the past. 
// This will limit number of Google Maps API calls.
async function log_request_if_interval_expired(client, interval, req) {
  // Set some vars
  const endpoint_id = req.body.endpoint.id
  const endpoint_name = req.body.endpoint.name
  const pdp_context = req.body.detail.pdp_context
  const coords_table = await client.query(`SELECT * FROM coords_table`)
  // If any entries in Table
  if (coords_table.rows.length > 0) {
    const mins_since_last_entry = await get_mins_since_last_entry(endpoint_id, client)
  }
  // If last entry calc shows undefined, log new entry
  if (typeof mins_since_last_entry === 'undefined') {
    lookup_coords_and_log(client, pdp_context, endpoint_id, endpoint_name)
    // If proper return value for minutes since last log entry
  } else if (mins_since_last_entry != null) {
    if (mins_since_last_entry >= interval) {
      console.log(`${info_log} - More than ${interval} mins since last entry for ${endpoint_id}`)
      lookup_coords_and_log(client, pdp_context, endpoint_id, endpoint_name)
    } else {
      // Do not log new entry if interval too soon in past
      console.log(`${info_log} - Entry already added for ${endpoint_id} ${mins_since_last_entry} minutes ago`)
    }
  } else {
    console.log(`${info_log} - Adding first entry for ${endpoint_id}`)
    lookup_coords_and_log(client, pdp_context, endpoint_id, endpoint_name)
  }
}

// Some module exports
module.exports.log_to_db = log_to_db;
module.exports.maps_api_post = maps_api_post;
module.exports.getMinutesSince = getMinutesSince;
module.exports.lookup_coords_and_log = lookup_coords_and_log;
module.exports.get_mins_since_last_entry = get_mins_since_last_entry;
module.exports.log_request_if_interval_expired = log_request_if_interval_expired;
