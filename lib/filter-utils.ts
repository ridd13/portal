/**
 * Build a URL for the /events page with the given filter parameters.
 * Empty/undefined values are omitted from the URL.
 */
export function buildFilterUrl(params: {
  tag?: string;
  city?: string;
  q?: string;
  from?: string;
  to?: string;
}): string {
  const sp = new URLSearchParams();

  if (params.tag) sp.set("tag", params.tag);
  if (params.city) sp.set("city", params.city);
  if (params.q) sp.set("q", params.q);
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);

  const qs = sp.toString();
  return qs ? `/events?${qs}` : "/events";
}
