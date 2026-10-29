export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Endpoint Terima Pendaftaran & Semak IC
    if (url.pathname === '/api/register' && request.method === 'POST') {
      try {
        const { name, ic_number } = await request.json();

        // Semak wujud atau tidak / status dalam database
        const existing = await env.DB.prepare(
          "SELECT status FROM users WHERE ic_number = ?"
        ).bind(ic_number).first();

        if (existing) {
          if (existing.status === 'blacklisted') {
            return Response.json({ 
              success: false, 
              message: "Maaf, nama anda telah disenarai hitam." 
            }, { status: 400 });
          }
          return Response.json({ 
            success: false, 
            message: "Maaf No IC anda pernah didaftarkan sebelum ini." 
          }, { status: 400 });
        }

        // Simpan rekod baru jika lepas semakan
        await env.DB.prepare(
          "INSERT INTO users (name, ic_number, status) VALUES (?, ?, 'pending')"
        ).bind(name, ic_number).run();

        return Response.json({ 
          success: true, 
          message: "Maklumat berjaya dihantar untuk semakan!" 
        });

      } catch (err) {
        return Response.json({ success: false, message: "Ralat server: " + err.message }, { status: 500 });
      }
    }

    // 2. Endpoint Tarik Senarai untuk Admin
    if (url.pathname === '/api/admin/users' && request.method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM users").all();
      return Response.json(results);
    }

    // 3. Endpoint Admin Ubah Status (Approve / Blacklist)
    if (url.pathname === '/api/admin/update' && request.method === 'POST') {
      const { id, status } = await request.json();
      await env.DB.prepare("UPDATE users SET status = ? WHERE id = ?").bind(status, id).run();
      return Response.json({ success: true, message: "Status berjaya dikemas kini!" });
    }

    return new Response("Not Found", { status: 404 });
  }
};
