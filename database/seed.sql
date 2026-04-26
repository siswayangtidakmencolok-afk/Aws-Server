-- ============================================================
-- Nusantara Telemedicine Portal - Seed Data
-- Sample data for development and testing.
-- Passwords are bcrypt hashes of '123456'
-- ============================================================

-- Insert sample users
-- Password: 123456 (bcrypt hash)
INSERT INTO users (email, password, role) VALUES
  ('patient1@mail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'patient'),
  ('patient2@mail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'patient'),
  ('dr.budi@mail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor'),
  ('dr.sari@mail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor'),
  ('dr.andi@mail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor'),
  ('dr.maya@mail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor')
ON CONFLICT (email) DO NOTHING;

-- Insert sample doctors
INSERT INTO doctors (name, specialization, user_id, bio) VALUES
  ('Dr. Budi Santoso', 'Kardiologi', 3, 'Spesialis jantung dan pembuluh darah dengan pengalaman 15 tahun di RS Pusat Jakarta.'),
  ('Dr. Sari Dewi', 'Dermatologi', 4, 'Ahli kulit dan kelamin, berpengalaman dalam perawatan kulit modern dan estetika.'),
  ('Dr. Andi Pratama', 'Neurologi', 5, 'Spesialis saraf dengan keahlian dalam penanganan migrain dan gangguan neurologis.'),
  ('Dr. Maya Putri', 'Pediatri', 6, 'Dokter anak yang berdedikasi untuk kesehatan dan tumbuh kembang anak-anak Indonesia.')
ON CONFLICT DO NOTHING;

-- Insert sample appointments
INSERT INTO appointments (user_id, doctor_id, schedule, status) VALUES
  (1, 1, '2026-05-01 09:00:00', 'confirmed'),
  (1, 2, '2026-05-03 14:00:00', 'pending'),
  (2, 3, '2026-05-02 10:30:00', 'pending'),
  (2, 4, '2026-05-05 11:00:00', 'confirmed')
ON CONFLICT DO NOTHING;
