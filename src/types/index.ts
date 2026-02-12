export interface Lead {
    id: string;
    created_at: string;
    name: string;
    email: string | null;
    phone: string | null;
    source: string | null;
    status: string | null;
    notes: string | null;
    country?: string | null;
    city?: string | null;
    tags?: string[];
    product_interest?: string | null;
    next_follow_up?: string | null;
    follow_up_method?: string | null;
    user_id?: string;
}

export interface Interaction {
    id: string;
    created_at: string;
    lead_id: string;
    type: 'note' | 'call' | 'email' | 'whatsapp' | 'meeting';
    content: string;
    user_id?: string;
}
