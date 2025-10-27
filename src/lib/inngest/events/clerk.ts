/**
 * Clerk authentication event schemas
 */
export interface ClerkEvents {
  "clerk/user.created": {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    created_at: number;
    updated_at: number;
  };
  "clerk/user.updated": {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    updated_at: number;
  };
  "clerk/user.deleted": {
    id: string;
    deleted: boolean;
  };
  "clerk/session.created": {
    id: string;
    user_id: string;
    status: string;
    created_at: number;
  };
  "clerk/session.ended": {
    id: string;
    user_id: string;
    ended_at: number;
  };
  "clerk/organization.created": {
    id: string;
    name: string;
    slug: string;
    created_by: string;
    created_at: number;
  };
  "clerk/organization.updated": {
    id: string;
    name?: string;
    slug?: string;
    updated_at: number;
  };
  "clerk/organization.deleted": {
    id: string;
    deleted: boolean;
  };
  "clerk/organizationMembership.created": {
    id: string;
    organization_id: string;
    user_id: string;
    role: string;
    created_at: number;
  };
  "clerk/organizationMembership.updated": {
    id: string;
    organization_id: string;
    user_id: string;
    role?: string;
    updated_at: number;
  };
  "clerk/organizationMembership.deleted": {
    id: string;
    organization_id: string;
    user_id: string;
    deleted: boolean;
  };
}

