export type UserRole = 'superadmin' | 'admin' | 'ae';

export interface Profile {
    id: string;
    email: string;
    role: UserRole;
    display_name: string | null;
    must_change_password: boolean;
    created_at: string;
    updated_at: string;
}
