export interface Host {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  website_url: string | null;
  social_links: Record<string, string> | null;
  owner_id: string | null;
  created_at: string | null;
}

export interface HostPreview {
  name: string;
  slug: string | null;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  location_name: string | null;
  address: string | null;
  geo_lat: number | null;
  geo_lng: number | null;
  cover_image_url: string | null;
  host_id: string | null;
  is_public: boolean | null;
  status: string | null;
  tags: string[] | null;
  price_model: string | null;
  ticket_link: string | null;
  created_at: string | null;
  hosts: HostPreview | HostPreview[] | null;
}
