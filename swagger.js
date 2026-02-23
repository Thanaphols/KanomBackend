const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: { title: 'My API', description: 'Description' },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js']; // ชี้ไปยังไฟล์หลักที่มี routes ของคุณ

swaggerAutogen(outputFile, endpointsFiles, doc);
