const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Inisialisasi Bedrock Client
// Region mengikuti region default AWS Lambda Anda (biasanya us-east-1 atau ap-southeast-1)
const client = new BedrockRuntimeClient();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { symptoms } = body;

    if (!symptoms) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: "Gejala (symptoms) wajib diisi." }),
      };
    }

    // Prompt khusus agar AI bertindak sebagai asisten medis cerdas
    const prompt = `Human: Anda adalah asisten medis cerdas di aplikasi Nusantara Telemedicine.
Tugas Anda adalah membaca keluhan pasien, lalu memberikan tiga hal secara singkat dan jelas:
1. Kemungkinan penyebab (diagnosis awal non-mengikat).
2. Saran penanganan pertama (First Aid).
3. Rekomendasi dokter spesialis yang harus ditemui (Pilih dari: Umum, Gigi, Anak, Kandungan, Mata, Kulit & Kelamin, THT, Penyakit Dalam, Saraf).

Tulis dalam format JSON dengan key: "diagnosis", "firstAid", "recommendedSpecialist".
Jangan tambahkan teks apapun di luar format JSON tersebut.

Keluhan Pasien: ${symptoms}

Assistant:`;

    // Menggunakan model Anthropic Claude v2 (Pastikan model ini aktif di AWS Console Anda)
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-v2",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: prompt,
        max_tokens_to_sample: 500,
        temperature: 0.2, // Temperature rendah agar jawabannya konsisten/objektif
        top_k: 250,
        top_p: 1,
      }),
    });

    const response = await client.send(command);
    
    // Parse response dari Bedrock
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const aiCompletion = responseBody.completion;

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: aiCompletion, // AI sudah membalas dalam bentuk JSON string berkat instruksi kita
    };

  } catch (error) {
    console.error("Bedrock Error:", error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: "Terjadi kesalahan saat memproses data AI.", 
        error: error.message 
      }),
    };
  }
};
