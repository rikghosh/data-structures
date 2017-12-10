var express = require('express'),
    app = express();
const { Pool } = require('pg');

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'rikghosh';
db_credentials.host = process.env.AWSRDS_EP;
db_credentials.database = 'datastructures';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;


app.get('/', function(req, res) {
    // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);

    // SQL query
    var q = `SELECT EXTRACT(MINUTE FROM time AT TIME ZONE 'America/New_York') as minute,
                EXTRACT(HOUR FROM time AT TIME ZONE 'America/New_York') as hour, 
                EXTRACT(DAY FROM time AT TIME ZONE 'America/New_York') as day,
                EXTRACT(MONTH FROM time AT TIME ZONE 'America/New_York') as month,
                count(*) as num_obs,
                max(irstatus) as walked_past,
                round(avg(force)) as water_amount
                FROM fsrData LEFT OUTER JOIN irData USING (time)
                GROUP BY month, day, hour, minute;`;
             
    client.connect();
    client.query(q, (qerr, qres) => {
        res.send(qres.rows);
        console.log('responded to request');
    });
    client.end();
});

app.listen(process.env.PORT, function() {
// app.listen(3000, function() {
    console.log('Server listening...');
});