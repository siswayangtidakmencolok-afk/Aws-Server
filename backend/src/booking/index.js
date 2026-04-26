/**
 * Booking Lambda Function
 * Handles appointment creation and sends events to SQS.
 */

const { query } = require('../../shared/db');
const response = require('../../shared/response');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const sqs = new SQSClient({});

/**
 * POST /appointment
 * Create a new appointment booking.
 * Saves to PostgreSQL and sends event to SQS booking queue.
 */
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { doctor_id, schedule } = body;

    // Extract user ID from authorizer context
    const userId = event.requestContext?.authorizer?.userId;

    if (!userId) {
      return response.unauthorized('User not authenticated');
    }

    if (!doctor_id || !schedule) {
      return response.badRequest('doctor_id and schedule are required');
    }

    // Validate doctor exists
    const doctorCheck = await query('SELECT id, name FROM doctors WHERE id = $1', [doctor_id]);
    if (doctorCheck.rows.length === 0) {
      return response.notFound('Doctor not found');
    }

    // Validate schedule is in the future
    const scheduleDate = new Date(schedule);
    if (scheduleDate <= new Date()) {
      return response.badRequest('Schedule must be in the future');
    }

    // Check for conflicting appointments
    const conflict = await query(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 AND schedule = $2 AND status != 'cancelled'`,
      [doctor_id, scheduleDate]
    );
    if (conflict.rows.length > 0) {
      return response.badRequest('This time slot is already booked');
    }

    // Insert appointment
    const result = await query(
      `INSERT INTO appointments (user_id, doctor_id, schedule, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id, user_id, doctor_id, schedule, status`,
      [userId, doctor_id, scheduleDate]
    );

    const appointment = result.rows[0];

    // Send event to SQS booking queue for notification processing
    const queueUrl = process.env.BOOKING_QUEUE_URL;
    if (queueUrl) {
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify({
            type: 'BOOKING_CREATED',
            appointment: {
              ...appointment,
              doctorName: doctorCheck.rows[0].name,
            },
            timestamp: new Date().toISOString(),
          }),
          MessageAttributes: {
            EventType: {
              DataType: 'String',
              StringValue: 'BOOKING_CREATED',
            },
          },
        })
      );
    }

    return response.success(appointment, 201);
  } catch (err) {
    console.error('Booking error:', err);
    return response.error('Failed to create appointment');
  }
};

/**
 * GET /appointment
 * Get all appointments for the authenticated user.
 */
exports.listHandler = async (event) => {
  try {
    const userId = event.requestContext?.authorizer?.userId;
    const userRole = event.requestContext?.authorizer?.role;

    if (!userId) {
      return response.unauthorized('User not authenticated');
    }

    let result;
    if (userRole === 'doctor') {
      // Doctors see appointments assigned to them
      result = await query(
        `SELECT a.id, a.schedule, a.status,
                u.email as patient_email,
                d.name as doctor_name, d.specialization
         FROM appointments a
         JOIN users u ON a.user_id = u.id
         JOIN doctors d ON a.doctor_id = d.id
         WHERE d.user_id = $1
         ORDER BY a.schedule DESC`,
        [userId]
      );
    } else {
      // Patients see their own appointments
      result = await query(
        `SELECT a.id, a.schedule, a.status,
                d.name as doctor_name, d.specialization
         FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id
         WHERE a.user_id = $1
         ORDER BY a.schedule DESC`,
        [userId]
      );
    }

    return response.success(result.rows);
  } catch (err) {
    console.error('List appointments error:', err);
    return response.error('Failed to fetch appointments');
  }
};
