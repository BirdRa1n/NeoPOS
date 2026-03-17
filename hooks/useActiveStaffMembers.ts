import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';

export interface StaffMember {
  id: string;
  display_name: string | null;
  user: { email: string; raw_user_meta_data: { name?: string } } | null;
}

export function memberName(m: StaffMember): string {
  return (
    m.display_name ||
    m.user?.raw_user_meta_data?.name ||
    m.user?.email?.split('@')[0] ||
    m.id.slice(0, 8)
  );
}

export function useActiveStaffMembers(storeId?: string) {
  const [members, setMembers] = useState<StaffMember[]>([]);

  useEffect(() => {
    if (!storeId) return;
    supabase
      .schema('core')
      .from('staff_members_with_user')
      .select('id, display_name, user_email, user_name, user_meta')
      .eq('store_id', storeId)
      .eq('status', 'active')
      .then(({ data }) => {
        const mapped: StaffMember[] = (data ?? []).map((row: any) => ({
          id: row.id,
          display_name: row.display_name,
          user: {
            email: row.user_email ?? '',
            raw_user_meta_data: row.user_meta ?? {},
          },
        }));
        setMembers(mapped);
      });
  }, [storeId]);

  return members;
}
