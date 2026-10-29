export async function onRequestPost(context) {
  try {
    const input = await context.request.json();
    const { name, ic_number } = input;

    // Semak IC dalam database D1
    const existing = await context.env.DB.prepare(
      "SELECT status FROM users WHERE ic_number = ?"
    ).bind(ic_number).first();

    if (existing) {
      if (existing.status === 'blacklisted') {
        return Response.json({ success: false, message: "Maaf, nama anda telah disenarai hitam." }, { status: 400 });
      }
      return Response.json({ success: false, message: "Maaf No IC anda pernah didaftarkan sebelum ini." }, { status: 400 });
    }

    // Simpan data baru jika belum ada
    await context.env.DB.prepare(
      "INSERT INTO users (name, ic_number, status) VALUES (?, ?, 'pending')"
    ).bind(name, ic_number).run();

    return Response.json({ success: true, message: "Maklumat berjaya dihantar untuk semakan!" });

  } catch (err) {
    return Response.json({ success: false, message: "Ralat server: " + err.message }, { status: 500 });
  }
}
