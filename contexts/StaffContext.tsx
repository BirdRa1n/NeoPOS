'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/supabase/client';
import { useAuth } from './AuthContext';

export type OrderType = 'delivery' | 'pickup' | 'table';

export interface StaffRole {
  id: string;
  name: string;
  color: string;
  description: string | null;
  perm_orders_view: boolean;
  perm_orders_create: boolean;
  perm_orders_edit: boolean;
  perm_orders_delete: boolean;
  perm_orders_change_status: boolean;
  perm_inventory_view: boolean;
  perm_inventory_edit: boolean;
  perm_catalog_view: boolean;
  perm_catalog_edit: boolean;
  perm_finance_view: boolean;
  perm_customers_view: boolean;
  perm_reports_view: boolean;
  perm_store_settings: boolean;
  perm_staff_manage: boolean;
  // legado
  allowed_order_types: OrderType[] | null;
  // novos — null = sem restrição (todos os tipos)
  allowed_view_order_types: OrderType[] | null;
  allowed_create_order_types: OrderType[] | null;
  allowed_edit_order_types: OrderType[] | null;
  allowed_delete_order_types: OrderType[] | null;
}

export interface StaffMemberInfo {
  id: string;
  store_id: string;
  user_id: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  display_name: string | null;
  role: StaffRole | null;
}

export type UserRole = 'owner' | 'staff' | null;

interface StaffContextType {
  userRole: UserRole;
  staffInfo: StaffMemberInfo | null;
  perms: StaffRole | null;
  loading: boolean;
  can: (perm: keyof StaffRole) => boolean;
  /** null = sem restrição (todos); array vazio = nenhum permitido */
  allowedOrderTypes: (op: 'view' | 'create' | 'edit' | 'delete') => OrderType[] | null;
  canOrderType: (op: 'view' | 'create' | 'edit' | 'delete', type: OrderType) => boolean;
  refetch: () => Promise<void>;
}

const StaffContext = createContext<StaffContextType>({
  userRole: null, staffInfo: null, perms: null, loading: true,
  can: () => false, allowedOrderTypes: () => null, canOrderType: () => false, refetch: async () => {},
});

export function StaffProvider({ children, storeId }: { children: ReactNode; storeId: string | null }) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [staffInfo, setStaffInfo] = useState<StaffMemberInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async () => {
    if (!user || !storeId) return;
    setLoading(true);
    try {
      const { data: store } = await supabase.schema('core').from('stores').select('id')
        .eq('id', storeId).eq('user_id', user.id).maybeSingle();
      if (store) { setUserRole('owner'); setStaffInfo(null); return; }

      const { data: member } = await supabase.schema('core').from('staff_members')
        .select(`id,store_id,user_id,status,display_name,role:role_id(
          id,name,color,description,
          perm_orders_view,perm_orders_create,perm_orders_edit,perm_orders_delete,perm_orders_change_status,
          perm_inventory_view,perm_inventory_edit,perm_catalog_view,perm_catalog_edit,
          perm_finance_view,perm_customers_view,perm_reports_view,perm_store_settings,perm_staff_manage,
          allowed_order_types,allowed_view_order_types,allowed_create_order_types,
          allowed_edit_order_types,allowed_delete_order_types
        )`)
        .eq('store_id', storeId).eq('user_id', user.id).maybeSingle();

      if (member) {
        setUserRole('staff');
        setStaffInfo({ id: member.id, store_id: member.store_id, user_id: member.user_id,
          status: member.status, display_name: member.display_name,
          role: (member.role as StaffRole) ?? null });
      } else { setUserRole(null); setStaffInfo(null); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRole(); }, [user, storeId]);

  const can = (perm: keyof StaffRole): boolean => {
    if (userRole === 'owner') return true;
    if (!staffInfo?.role) return false;
    return staffInfo.role[perm] === true;
  };

  const allowedOrderTypes = (op: 'view' | 'create' | 'edit' | 'delete'): OrderType[] | null => {
    if (userRole === 'owner') return null;
    if (!staffInfo?.role) return [];
    const map: Record<string, OrderType[] | null> = {
      view: staffInfo.role.allowed_view_order_types,
      create: staffInfo.role.allowed_create_order_types,
      edit: staffInfo.role.allowed_edit_order_types,
      delete: staffInfo.role.allowed_delete_order_types,
    };
    return map[op] ?? null;
  };

  const canOrderType = (op: 'view' | 'create' | 'edit' | 'delete', type: OrderType): boolean => {
    if (userRole === 'owner') return true;
    const allowed = allowedOrderTypes(op);
    if (allowed === null) return true;
    return allowed.includes(type);
  };

  return (
    <StaffContext.Provider value={{ userRole, staffInfo, perms: staffInfo?.role ?? null, loading, can, allowedOrderTypes, canOrderType, refetch: fetchRole }}>
      {children}
    </StaffContext.Provider>
  );
}

export const useStaff = () => useContext(StaffContext);
