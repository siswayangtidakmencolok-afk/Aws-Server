/**
 * Doctor Lambda Function
 * Handles fetching the list of available doctors.
 */

const { query } = require('../../shared/db');
const response = require('../../shared/response');

/**
 * GET /doctor
 * Returns a list of all doctors with their specializations.
 */
exports.handler = async (event) => {
  try {
    const result = await query(
      `SELECT d.id, d.name, d.specialization, u.email
       FROM doctors d
       LEFT JOIN users u ON d.user_id = u.id
       ORDER BY d.name ASC`
    );

    return response.success(result.rows);
  } catch (err) {
    console.error('Get doctors error:', err);
    return response.error('Failed to fetch doctors');
  }
};

/**
 * GET /doctor/{id}
 * Returns a single doctor by ID.
 */
exports.getByIdHandler = async (event) => {
  try {
    const doctorId = event.pathParameters?.id;

    if (!doctorId) {
      return response.badRequest('Doctor ID is required');
    }

    const result = await query(
      `SELECT d.id, d.name, d.specialization, u.email
       FROM doctors d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [doctorId]
    );

    if (result.rows.length === 0) {
      return response.notFound('Doctor not found');
    }

    return response.success(result.rows[0]);
  } catch (err) {
    console.error('Get doctor by ID error:', err);
    return response.error('Failed to fetch doctor');
  }
};
