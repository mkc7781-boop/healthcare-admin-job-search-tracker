const base = process.env.APP_URL ?? "http://localhost:3000";
let failed = false;

function check(label, ok) {
  console.log(label, ok ? "OK" : "FAIL");
  if (!ok) failed = true;
}

try {
  const createRes = await fetch(`${base}/api/agent/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      region: "sacramento",
      employer: "UC Davis Health",
      position: "Healthcare Administrator",
      priority: "high",
      status: "need_to_apply",
      city: "Sacramento",
      notes: "Test lead from agent API",
    }),
  });
  const createData = await createRes.json();
  console.log("POST /api/agent/leads:", createRes.status, createData.success ? "success" : createData);
  check("Create lead", createRes.status === 201);

  const listRes = await fetch(`${base}/api/agent/leads`);
  const listData = await listRes.json();
  console.log("GET /api/agent/leads:", listRes.status, "leads:", listData.leads?.length);
  check("List leads", listRes.status === 200);

  const pageRes = await fetch(`${base}/`);
  console.log("GET /:", pageRes.status);
  check("Homepage", pageRes.status === 200);
} catch (err) {
  console.log("FAIL:", err.message);
  console.log("Is the server running? Run start.bat first.");
  failed = true;
}

process.exit(failed ? 1 : 0);