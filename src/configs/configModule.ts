export default () => ({
    // database: {
    //     type: 'postgres',
    //     host: process.env.DATABSE_HOST || 'localhost',
    //     port: process.env.DATABASE_PORT || 5432,
    //     username: process.env.DATABASE_USERNAME,
    //     password: process.env.DATABASE_PASSWORD,
    //     name: process.env.DATABASE_NAME,
    //     ssl: process.env.DATABSE_SSL || false
    // }
    database: {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        name: 'postgres',
        ssl: false

    }
})