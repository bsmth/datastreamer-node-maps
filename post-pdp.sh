#!/bin/sh

# Enter a value for the server
# Find this by running 'heroku apps:info'
# This value is the last entry (Web URL:)

server=""

# Make a test POST request:
curl -X POST "$server" -H 'Content-type: application/json' -H 'accept: application/json' --data "{\"id\": 1337,\"detail\": {\"pdp_context\": {\"mcc\": \"262\",\"gtp_version\": \"1\",\"ratezone_id\": \"2\",\"tx_teid_data_plane\": 33708350,\"ue_ip_address\": \"1.2.3.4\",\"tariff_id\": \"5\",\"pdp_context_id\": \"106\",\"rx_teid\": \"106\",\"tariff_profile_id\": \"234\",\"tx_teid_control_plane\": 33708350,\"ggsn_control_plane_ip_address\": \"1.2.3.4\",\"imeisv\": \"8664250000000000\",\"breakout_ip\": \"1.2.3.4\",\"operator_id\": \"5\",\"nsapi\": 5,\"ci\": 15029,\"mnc\": \"03\",\"region\": \"eu-west-1\",\"lac\": 22021,\"sgsn_data_plane_ip_address\": \"1.2.3.4\",\"tunnel_created\": \"2019-12-10T10:27:18\",\"ggsn_data_plane_ip_address\": \"1.2.3.4\",\"imsi\": \"295090001006351\",\"rac\": null,\"sac\": null,\"sgsn_control_plane_ip_address\": \"1.2.3.4\",\"rat_type\": 2,\"apn\": \"em\"},\"id\": 5,\"country\": {\"country_code\": \"49\",\"id\": 74,\"mcc\": \"262\",\"iso_code\": \"de\",\"name\": \"Germany\"},\"name\": \"Telefonica\"},\"alert\": 0,\"event_type\": {\"id\": 3,\"description\": \"Create PDP Context\"},\"organisation\": {\"id\": 1572,\"name\": \"EMnify\"},\"event_severity\": {\"id\": 0,\"description\": \"INFO\"},\"endpoint\": {\"id\": 1337,\"tags\": null,\"imei\": \"8664000000000000\",\"ip_address\": \"1.2.3.4\",\"name\": \"My Test Device\"},\"timestamp\": \"2019-12-10 10:27:18\",\"event_source\": {\"id\": 0,\"name\": \"Network\"},\"imsi\": {\"id\": 3674223,\"import_date\": \"2019-01-22 14:05:30\",\"imsi\": \"295090000000000\"},\"sim\": {\"msisdn\": \"423663910000000\",\"id\": 1634486,\"production_date\": \"2019-01-22 14:05:30\",\"iccid\": \"8988303000000000000\"},\"description\": \"New PDP Context successfully activated with SGSN CP=1.2.3.4, DP=1.2.3.4.\"}"
