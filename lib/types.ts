export interface Host {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  website_url: string | null;
  social_links: Record<string, string> | null;
  owner_id: string | null;
  created_at: string | null;
  telegram_username: string | null;
  email: string | null;
  avatar_url: string | null;
  city: string | null;
  region: string | null;
}

export interface HostPreview {
  name: string;
  slug: string | null;
}

export type EventFormat = "event" | "workshop" | "retreat" | "kurs" | "festival" | "kreis";

export type LocationType = "venue" | "retreat_center" | "outdoor" | "coworking" | "online" | "private" | "other";

export interface Location {
  id: string;
  name: string;
  slug: string;
  type: LocationType;
  description: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  region: string | null;
  country: string | null;
  geo_lat: number | null;
  geo_lng: number | null;
  cover_image_url: string | null;
  gallery_urls: string[] | null;
  website_url: string | null;
  contact_email: string | null;
  phone: string | null;
  social_links: Record<string, string> | null;
  capacity: number | null;
  amenities: string[] | null;
  opening_hours: Record<string, string> | null;
  overnight_possible: boolean | null;
  wheelchair_accessible: boolean | null;
  tags: string[] | null;
  host_id: string | null;
  is_claimed: boolean;
  event_count: number;
  created_at: string | null;
}

export interface LocationPreview {
  name: string;
  slug: string;
  type: LocationType;
  city: string | null;
}

export interface Category {
  id: number;
  slug: string;
  name_de: string;
  name_en: string;
  group_name: string;
  description_de: string | null;
  icon: string | null;
  sort_order: number;
}

export interface DescriptionSections {
  what_to_expect?: string;
  what_youll_experience?: string[];
  who_is_this_for?: string;
  what_youll_take_away?: string[];
  schedule?: string;
  location_details?: string;
  is_beginner_friendly?: boolean;
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
  event_format: EventFormat | null;
  price_model: string | null;
  price_amount: string | null;
  ticket_link: string | null;
  created_at: string | null;
  hosts: HostPreview | HostPreview[] | null;
  is_online: boolean | null;
  description_sections: DescriptionSections | null;
  source_type: "manual" | "telegram" | "form" | null;
  source_message_id: string | null;
  location_id: string | null;
  locations: LocationPreview | null;
  event_categories?: { categories: Category }[];
  capacity: number | null;
  waitlist_enabled: boolean;
  registration_enabled: boolean;
}

export type RegistrationStatus = "confirmed" | "waitlisted" | "cancelled" | "declined";
export type PaymentStatus = "not_required" | "pending" | "paid" | "refunded";

export interface EventRegistration {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: RegistrationStatus;
  payment_status: PaymentStatus;
  payment_amount_cents: number | null;
  confirmation_token: string;
  confirmed_at: string | null;
  created_at: string;
}
