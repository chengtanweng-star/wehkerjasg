export async function onRequestPost(context) {
  try {
    const { id, status } = await context.request.json();
    await context.env.DB.prepare("UPDATE users SET status = ? WHERE id = ?").bind(status, id).run();
    return Response.json({ success: true, message: "Status dikemas kini!" });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

