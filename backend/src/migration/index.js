/**
 * Database Seeder for DynamoDB
 * Replaces the SQL-based RDS migration.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { hashPassword } = require('../../shared/auth-utils');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log('Starting DynamoDB seeding...');
  
  try {
    const usersTable = process.env.USERS_TABLE;
    const doctorsTable = process.env.DOCTORS_TABLE;
    const hashedPassword = await hashPassword('password123');

    // 1. Seed Sample Users
    const users = [
      { email: 'patient@example.com', password: hashedPassword, role: 'patient', userId: 'u1', name: 'John Patient' },
      { email: 'doctor1@example.com', password: hashedPassword, role: 'doctor', userId: 'u2', name: 'Dr. Smith' }
    ];

    for (const user of users) {
      await docClient.send(new PutCommand({
        TableName: usersTable,
        Item: user
      }));
    }

    // 2. Seed Sample Doctors
    const doctors = [
      { id: 'd1', name: 'Dr. Andi Pratama', specialization: 'Umum', email: 'andi@telemedicine.lks' },
      { id: 'd2', name: 'Dr. Budi Santoso', specialization: 'Jantung', email: 'budi@telemedicine.lks' },
      { id: 'd3', name: 'Dr. Citra Lestari', specialization: 'Anak', email: 'citra@telemedicine.lks' }
    ];

    for (const doctor of doctors) {
      await docClient.send(new PutCommand({
        TableName: doctorsTable,
        Item: doctor
      }));
    }

    console.log('DynamoDB seeding completed successfully!');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'success', message: 'DynamoDB seeded successfully' })
    };
  } catch (error) {
    console.error('Seeding failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', error: error.message })
    };
  }
};
