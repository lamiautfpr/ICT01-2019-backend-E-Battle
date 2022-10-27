'use strict';

const { Pool } = require('pg')

const pool = new Pool({
    user: 'ebattle',
    host: 'lamiadb1.ceoy3jbkraru.us-east-1.rds.amazonaws.com',
    database: 'ebattle',
    password: '!M;,T?gO#Vkp',
    port: 5432,
})

exports.getConn = async () => {
    return pool;
}
