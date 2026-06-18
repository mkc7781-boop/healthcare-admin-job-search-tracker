export type ActionResult = { ok: true } | { ok: false; error: string };

export function actionError(err: unknown, fallback = "Something went wrong."): ActionResult {
  return {
    ok: false,
    error: err instanceof Error ? err.message : fallback,
  };
}