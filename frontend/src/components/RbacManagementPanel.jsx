'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Users,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Lock,
  Sparkles,
  FileClock,
  RefreshCw,
  X,
  UserPlus,
  Sliders,
  MapPin,
  Clock,
  Check,
  XCircle,
  Phone,
} from 'lucide-react';
import { api } from '../lib/api';
import MultiSelectDropdown from './common/MultiSelectDropdown';
import {
  CHANDRAPUR_TALUKAS,
  CHANDRAPUR_SUBDIVISIONS,
  JURISDICTION_SCOPE_OPTIONS,
} from '../lib/constants';
import { useAuth } from './AuthContext';
import { useTranslation } from './LanguageContext';

const MODULE_LABELS = {
  parcels: { en: 'Land Parcels & Data Editing', mr: 'भूखंड नोंदवही व डेटा संपादन' },
  prapatra: { en: 'Prapatra, Booklets & Village Purge', mr: 'प्रपत्रे, पुस्तिका व गाव डेटा हटवणे' },
  drive_sync: { en: 'Google Drive Sync', mr: 'गुगल ड्राइव्ह सिंक नियंत्रण' },
  cases: { en: 'Enforcement Cases & Orders', mr: 'कायदेशीर प्रकरणे व आदेश' },
  documents: { en: 'Archival Documents (DMS)', mr: 'दस्तऐवज संग्रह (DMS)' },
  admin: { en: 'Administration & Jurisdiction', mr: 'प्रशासन, वापरकर्ते व कार्यक्षेत्र अधिकार' },
};

const SCOPE_LABELS = Object.fromEntries(
  JURISDICTION_SCOPE_OPTIONS.map((opt) => [opt.value, opt])
);

function JurisdictionMappingFields({
  scope = 'TALUKA',
  subdivision = '',
  taluka = '',
  assignedTalukas = [],
  assignedCircles = [],
  assignedVillages = [],
  onChange,
  disabled = false,
  isMarathi = false,
}) {
  const effectiveTalukas = useMemo(
    () => (assignedTalukas.length > 0 ? assignedTalukas : taluka ? [taluka] : []),
    [assignedTalukas, taluka]
  );
  const [circles, setCircles] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loadingGeo, setLoadingGeo] = useState(false);

  useEffect(() => {
    api.prefetchGeoDirectory();
  }, []);

  useEffect(() => {
    if (effectiveTalukas.length === 0) {
      setCircles([]);
      setVillages([]);
      return;
    }
    let active = true;
    const loadGeo = async () => {
      setLoadingGeo(true);
      try {
        const [cRes, vRes] = await Promise.all([
          api.getTalukaCircles(effectiveTalukas),
          api.getTalukaVillages(effectiveTalukas),
        ]);
        if (!active) return;
        setCircles(cRes?.circles || []);
        setVillages(vRes?.villages || []);
      } catch {
        if (active) {
          setCircles([]);
          setVillages([]);
        }
      } finally {
        if (active) setLoadingGeo(false);
      }
    };
    loadGeo();
    return () => {
      active = false;
    };
  }, [effectiveTalukas]);

  const talukaOptions = useMemo(
    () =>
      CHANDRAPUR_TALUKAS.map((t) => ({
        value: t.id,
        label: isMarathi ? t.nameMr : t.nameEn,
        subLabel: isMarathi ? t.nameEn : t.nameMr,
      })),
    [isMarathi]
  );

  const circleOptions = useMemo(
    () =>
      circles.map((c) => ({
        value: c.revenueCircle,
        label: c.revenueCircle,
        subLabel: c.taluka || '',
      })),
    [circles]
  );

  const villageOptions = useMemo(
    () =>
      villages.map((v) => ({
        value: v.villageName,
        label: v.villageName,
        subLabel: v.taluka || '',
      })),
    [villages]
  );

  return (
    <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>{isMarathi ? 'कार्यक्षेत्र मॅपिंग (Jurisdiction Mapping)' : 'Jurisdiction Mapping'}</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
          {isMarathi ? SCOPE_LABELS[scope]?.labelMr || scope : SCOPE_LABELS[scope]?.labelEn || scope}
        </span>
      </div>

      {disabled && (
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isMarathi
              ? 'कार्यक्षेत्र मॅपिंग बदलण्याचे अधिकार केवळ जिल्हाधिकारी (Superadmin) यांना आहेत.'
              : 'Only Superadmin can modify jurisdiction mappings (Sub-Division / Taluka / Circles / Villages).'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            {isMarathi ? 'उपविभाग (Sub-Division)' : 'Sub-Division'}
          </label>
          <select
            disabled={disabled}
            value={subdivision}
            onChange={(e) => {
              const subId = e.target.value;
              const sub = CHANDRAPUR_SUBDIVISIONS.find((s) => s.id === subId);
              onChange({
                subdivision: subId,
                taluka: sub?.talukas?.[0] || taluka,
                assignedTalukas: sub ? [...sub.talukas] : assignedTalukas,
              });
            }}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white disabled:opacity-60"
          >
            <option value="">{isMarathi ? '-- उपविभाग निवडा (ऐच्छिक) --' : '-- Optional Sub-Division --'}</option>
            {CHANDRAPUR_SUBDIVISIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {isMarathi ? s.nameMr : s.nameEn}
              </option>
            ))}
          </select>
        </div>

        <MultiSelectDropdown
          label={isMarathi ? 'नियुक्त तालुके (Multi-Taluka)' : 'Assigned Talukas (Multi-Select)'}
          options={talukaOptions}
          selectedValues={effectiveTalukas}
          disabled={disabled}
          onChange={(nextTalukas) =>
            onChange({
              assignedTalukas: nextTalukas,
              taluka: nextTalukas[0] || '',
            })
          }
          placeholder={isMarathi ? 'संपूर्ण जिल्हा / तालुके निवडा...' : 'District-wide or select Talukas...'}
          searchPlaceholder={isMarathi ? 'तालुका शोधा...' : 'Search talukas...'}
          selectAllText={isMarathi ? 'सर्व निवडा' : 'Select All'}
          clearText={isMarathi ? 'सर्व काढा' : 'Clear'}
          selectedLabelText={isMarathi ? 'तालुके' : 'selected'}
        />
      </div>

      {effectiveTalukas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <MultiSelectDropdown
            label={isMarathi ? 'महसूल मंडळे (Revenue Circles)' : 'Revenue Circles'}
            options={circleOptions}
            selectedValues={assignedCircles}
            disabled={disabled}
            loading={loadingGeo}
            loadingText={isMarathi ? 'मंडळे लोड होत आहेत...' : 'Loading circles...'}
            onChange={(nextCircles) => onChange({ assignedCircles: nextCircles })}
            placeholder={isMarathi ? 'महसूल मंडळे निवडा...' : 'Select Revenue Circles...'}
            searchPlaceholder={isMarathi ? 'मंडळ शोधा...' : 'Search circles...'}
            emptyText={isMarathi ? 'मंडळे उपलब्ध नाहीत' : 'No circles found'}
            selectAllText={isMarathi ? 'सर्व निवडा' : 'Select All'}
            clearText={isMarathi ? 'सर्व काढा' : 'Clear'}
            selectedLabelText={isMarathi ? 'मंडळे' : 'selected'}
          />

          <MultiSelectDropdown
            label={isMarathi ? 'गावे / सझा (Assigned Villages)' : 'Assigned Villages'}
            options={villageOptions}
            selectedValues={assignedVillages}
            disabled={disabled}
            loading={loadingGeo}
            loadingText={isMarathi ? 'गावे लोड होत आहेत...' : 'Loading villages...'}
            onChange={(nextVillages) => onChange({ assignedVillages: nextVillages })}
            placeholder={isMarathi ? 'गावे निवडा...' : 'Select Villages...'}
            searchPlaceholder={isMarathi ? 'गाव शोधा...' : 'Search villages...'}
            emptyText={isMarathi ? 'गावे उपलब्ध नाहीत' : 'No villages found'}
            selectAllText={isMarathi ? 'सर्व निवडा' : 'Select All'}
            clearText={isMarathi ? 'सर्व काढा' : 'Clear'}
            selectedLabelText={isMarathi ? 'गावे' : 'selected'}
          />
        </div>
      )}
    </div>
  );
}

export default function RbacManagementPanel({ initialSection = 'roles' }) {
  const { user: currentUser, hasPermission, refreshUser } = useAuth();
  const { isMarathi } = useTranslation();

  const canViewRoles = hasPermission('role.view') || hasPermission('role.manage');
  const canManageRoles = hasPermission('role.manage');
  const canViewUsers = hasPermission('user.view') || hasPermission('user.manage');
  const canManageUsers = hasPermission('user.manage');
  const canViewAudit = hasPermission('audit.view');
  const isSuperadmin = Boolean(currentUser?.isWildcard);

  const [section, setSection] = useState(
    initialSection === 'users' && canViewUsers
      ? 'users'
      : initialSection === 'audit' && canViewAudit
      ? 'audit'
      : canViewRoles
      ? 'roles'
      : canViewUsers
      ? 'users'
      : 'audit'
  );

  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState('');

  const [feedback, setFeedback] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Role Editor State
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    nameMr: '',
    description: '',
    hierarchyLevel: 50,
    jurisdictionScope: 'TALUKA',
    isActive: true,
    permissions: [],
  });
  const [savingRole, setSavingRole] = useState(false);

  // Create Role Modal
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    nameMr: '',
    description: '',
    hierarchyLevel: 40,
    jurisdictionScope: 'TALUKA',
    permissions: ['parcel.view', 'prapatra.view', 'case.view', 'document.view'],
  });

  // User Search, Filter & Editor Modal
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    mobile: '',
    designation: '',
    taluka: '',
    subdivision: '',
    assignedTalukas: [],
    assignedCircles: [],
    assignedVillages: [],
    roleId: '',
    isActive: true,
    newPassword: '',
    overrides: [],
  });
  const [savingUser, setSavingUser] = useState(false);

  // Create User Modal
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    roleId: '',
    taluka: '',
    subdivision: '',
    assignedTalukas: [],
    assignedCircles: [],
    assignedVillages: [],
    designation: '',
  });

  const showToast = (msg) => {
    setFeedback(msg);
    setErrorMsg('');
    setTimeout(() => setFeedback(null), 5000);
  };

  const loadAll = async (forceRefresh = false) => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (canViewRoles || canViewUsers) {
        const res = await api.getRbacBootstrap(forceRefresh);
        setPermissions(res.permissions || []);
        const roleList = res.roles || [];
        setRoles(roleList);
        if (!selectedRoleId && roleList.length > 0) {
          setSelectedRoleId(roleList[0].id);
        }
        if (canViewUsers && Array.isArray(res.users)) {
          setUsers(res.users);
        }
      }
      if (canViewAudit && section === 'audit') {
        const auditRes = await api.getRbacAuditLogs({ limit: 40 }, forceRefresh);
        setAuditLogs(auditRes.logs || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'RBAC डेटा लोड करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll(false);
  }, []);

  // Lazy-load Audit Logs only when switching to the Audit tab
  useEffect(() => {
    if (section === 'audit' && canViewAudit && auditLogs.length === 0) {
      api.getRbacAuditLogs({ limit: 40 })
        .then((r) => setAuditLogs(r.logs || []))
        .catch(() => {});
    }
  }, [section, canViewAudit]);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || roles[0] || null,
    [roles, selectedRoleId]
  );

  const canEditSelectedRole = Boolean(
    selectedRole &&
      canManageRoles &&
      (isSuperadmin ||
        (!selectedRole.isWildcard &&
          (selectedRole.hierarchyLevel ?? 50) < (currentUser?.hierarchyLevel ?? 0)))
  );

  useEffect(() => {
    if (selectedRole) {
      setRoleForm({
        name: selectedRole.name || '',
        nameMr: selectedRole.nameMr || '',
        description: selectedRole.description || '',
        hierarchyLevel: selectedRole.hierarchyLevel ?? 50,
        jurisdictionScope: selectedRole.jurisdictionScope || 'TALUKA',
        isActive: selectedRole.isActive !== false,
        permissions: [...(selectedRole.permissions || [])],
      });
    }
  }, [selectedRole]);

  const groupedPermissions = useMemo(() => {
    const groups = {};
    for (const p of permissions) {
      if (!groups[p.module]) groups[p.module] = [];
      groups[p.module].push(p);
    }
    return groups;
  }, [permissions]);

  const toggleRolePermission = (permKey) => {
    if (!canEditSelectedRole || selectedRole?.isWildcard) return;
    setRoleForm((prev) => {
      const exists = prev.permissions.includes(permKey);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((k) => k !== permKey)
          : [...prev.permissions, permKey],
      };
    });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!selectedRole || !canEditSelectedRole) return;
    setSavingRole(true);
    setErrorMsg('');
    try {
      const res = await api.updateRbacRole(selectedRole.id, {
        name: roleForm.name,
        nameMr: roleForm.nameMr,
        description: roleForm.description,
        hierarchyLevel: Number(roleForm.hierarchyLevel),
        jurisdictionScope: roleForm.jurisdictionScope,
        isActive: roleForm.isActive,
        permissionKeys: selectedRole.isWildcard ? undefined : roleForm.permissions,
      });
      showToast(res.message || 'Role updated.');
      await loadAll();
      await refreshUser();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingRole(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setSavingRole(true);
    setErrorMsg('');
    try {
      const res = await api.createRbacRole({
        name: newRoleForm.name,
        nameMr: newRoleForm.nameMr,
        description: newRoleForm.description,
        hierarchyLevel: Number(newRoleForm.hierarchyLevel),
        jurisdictionScope: newRoleForm.jurisdictionScope,
        permissionKeys: newRoleForm.permissions,
      });
      setShowNewRoleModal(false);
      setNewRoleForm({
        name: '',
        nameMr: '',
        description: '',
        hierarchyLevel: 40,
        jurisdictionScope: 'TALUKA',
        permissions: ['parcel.view', 'prapatra.view', 'case.view', 'document.view'],
      });
      if (res.role?.id) setSelectedRoleId(res.role.id);
      showToast(res.message || 'Custom role created.');
      await loadAll();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (!canManageRoles || role.isSystem) return;
    if (!window.confirm(isMarathi ? `'${role.name}' भूमिका कायमची हटवायची का?` : `Delete custom role '${role.name}'?`)) {
      return;
    }
    setErrorMsg('');
    try {
      const res = await api.deleteRbacRole(role.id);
      setSelectedRoleId(null);
      showToast(res.message || 'Role deleted.');
      await loadAll();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const openEditUser = (u) => {
    setEditingUser(u);
    setUserForm({
      fullName: u.fullName || '',
      mobile: u.mobile || '',
      designation: u.designation || '',
      taluka: u.taluka || (u.assignedTalukas?.[0] || ''),
      subdivision: u.subdivision || '',
      assignedTalukas: Array.isArray(u.assignedTalukas) ? [...u.assignedTalukas] : (u.taluka ? [u.taluka] : []),
      assignedCircles: Array.isArray(u.assignedCircles) ? [...u.assignedCircles] : [],
      assignedVillages: Array.isArray(u.assignedVillages) ? [...u.assignedVillages] : [],
      roleId: u.roleId || '',
      isActive: u.isActive !== false,
      newPassword: '',
      overrides: [...(u.overrides || [])],
    });
  };

  const setOverrideEffect = (permKey, effect) => {
    setUserForm((prev) => {
      const filtered = prev.overrides.filter((o) => o.key !== permKey);
      if (effect === 'INHERIT') {
        return { ...prev, overrides: filtered };
      }
      return { ...prev, overrides: [...filtered, { key: permKey, effect }] };
    });
  };

  const handleSaveUser = async (e, approveAfterSave = false) => {
    if (e) e.preventDefault();
    if (!editingUser || !canManageUsers) return;
    setSavingUser(true);
    setErrorMsg('');
    try {
      const payload = {
        fullName: userForm.fullName,
        mobile: userForm.mobile,
        designation: userForm.designation,
        roleId: userForm.roleId,
        isActive: approveAfterSave ? true : userForm.isActive,
        overrides: userForm.overrides,
      };
      if (isSuperadmin) {
        payload.taluka = userForm.taluka || userForm.assignedTalukas[0] || null;
        payload.subdivision = userForm.subdivision || null;
        payload.assignedTalukas = userForm.assignedTalukas;
        payload.assignedCircles = userForm.assignedCircles;
        payload.assignedVillages = userForm.assignedVillages;
      }
      if (userForm.newPassword.trim()) {
        payload.newPassword = userForm.newPassword.trim();
      }

      const res = await api.updateRbacUser(editingUser.id, payload);
      if (approveAfterSave && isSuperadmin) {
        await api.approveRbacUser(editingUser.id, {
          roleId: userForm.roleId,
          designation: userForm.designation,
          subdivision: userForm.subdivision || null,
          taluka: userForm.taluka || userForm.assignedTalukas[0] || null,
          assignedTalukas: userForm.assignedTalukas,
          assignedCircles: userForm.assignedCircles,
          assignedVillages: userForm.assignedVillages,
        });
      }
      setEditingUser(null);
      showToast(
        approveAfterSave
          ? (isMarathi ? 'अधिकारी खाते मंजूर व सक्रिय केले!' : 'Officer account approved and activated.')
          : (res.message || 'User updated.')
      );
      await loadAll();
      if (editingUser.id === currentUser?.id) {
        await refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingUser(false);
    }
  };

  const handleQuickApproveUser = async (u) => {
    if (!isSuperadmin) return;
    setSavingUser(true);
    setErrorMsg('');
    try {
      const res = await api.approveRbacUser(u.id, {});
      showToast(res.message || 'Officer approved & activated.');
      await loadAll();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingUser(false);
    }
  };

  const handleQuickRejectUser = async (u) => {
    if (!isSuperadmin) return;
    const reason = window.prompt(
      isMarathi ? `'${u.fullName}' यांचे खाते नाकारण्याचे कारण नोंदवा:` : `Reason for rejecting '${u.fullName}':`
    );
    if (reason === null) return;
    setSavingUser(true);
    setErrorMsg('');
    try {
      const res = await api.rejectRbacUser(u.id, reason);
      showToast(res.message || 'Registration rejected.');
      await loadAll();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingUser(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    setErrorMsg('');
    try {
      const defaultRoleId =
        newUserForm.roleId ||
        roles.find((r) => r.slug === 'officer')?.id ||
        roles[roles.length - 1]?.id;
      const res = await api.createRbacUser({
        ...newUserForm,
        roleId: defaultRoleId,
        taluka: newUserForm.taluka || newUserForm.assignedTalukas[0] || null,
      });
      setShowNewUserModal(false);
      setNewUserForm({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        roleId: '',
        taluka: '',
        subdivision: '',
        assignedTalukas: [],
        assignedCircles: [],
        assignedVillages: [],
        designation: '',
      });
      showToast(res.message || 'User account created.');
      await loadAll();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingUser(false);
    }
  };

  const pendingCount = useMemo(
    () => users.filter((u) => u.approvalStatus === 'PENDING').length,
    [users]
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (userStatusFilter !== 'ALL' && u.approvalStatus !== userStatusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobile?.toLowerCase().includes(q) ||
        u.roleName?.toLowerCase().includes(q) ||
        u.taluka?.toLowerCase().includes(q) ||
        u.assignedTalukas?.some((t) => t.toLowerCase().includes(q)) ||
        u.assignedCircles?.some((c) => c.toLowerCase().includes(q)) ||
        u.assignedVillages?.some((v) => v.toLowerCase().includes(q))
      );
    });
  }, [users, userSearch, userStatusFilter]);

  const filteredLogs = useMemo(() => {
    const q = auditFilter.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (l) =>
        l.action?.toLowerCase().includes(q) ||
        l.entityType?.toLowerCase().includes(q) ||
        l.user?.email?.toLowerCase().includes(q) ||
        l.user?.fullName?.toLowerCase().includes(q)
    );
  }, [auditLogs, auditFilter]);

  const editUserRoleScope =
    roles.find((r) => r.id === userForm.roleId)?.jurisdictionScope || editingUser?.jurisdictionScope || 'TALUKA';
  const newUserRoleScope =
    roles.find((r) => r.id === (newUserForm.roleId || roles.find((x) => x.slug === 'officer')?.id))?.jurisdictionScope || 'TALUKA';

  return (
    <div className="space-y-4">
      {/* Sub-navigation bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {canViewRoles && (
            <button
              type="button"
              onClick={() => setSection('roles')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                section === 'roles'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'भूमिका व अधिकार (Roles & Permissions)' : 'Roles & Permissions'}</span>
            </button>
          )}
          {canViewUsers && (
            <button
              type="button"
              onClick={() => setSection('users')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                section === 'users'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'वापरकर्ते, मंजुरी व मॅपिंग' : 'Users, Approvals & Mapping'}</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
          {canViewAudit && (
            <button
              type="button"
              onClick={() => setSection('audit')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                section === 'audit'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileClock className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'सुरक्षा ऑडिट नोंदी' : 'Audit Logs'}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => loadAll(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isMarathi ? 'रिफ्रेश' : 'Refresh'}</span>
        </button>
      </div>

      {feedback && (
        <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold">{feedback}</span>
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: ROLES & PERMISSION MATRIX */}
      {section === 'roles' && canViewRoles && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                {isMarathi ? 'नोंदणीकृत भूमिका' : 'Configured Roles'}{' '}
                {loading && roles.length === 0 ? '' : `(${roles.length})`}
              </h3>
              {canManageRoles && (
                <button
                  type="button"
                  onClick={() => setShowNewRoleModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isMarathi ? 'नवीन भूमिका' : 'Add Role'}</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {loading && roles.length === 0 ? (
                <div className="space-y-2 py-1">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="h-3.5 w-28 bg-slate-200 rounded" />
                        <div className="h-3.5 w-14 bg-slate-200 rounded" />
                      </div>
                      <div className="h-2.5 w-36 bg-slate-200/70 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                roles.map((r) => {
                const isSelected = selectedRole?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-500/20'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-900 truncate">
                        {isMarathi ? (r.nameMr || r.name) : r.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                          {r.isActive ? (isMarathi ? 'सक्रिय' : 'Active') : (isMarathi ? 'बंद' : 'Off')}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                          {r.jurisdictionScope || 'TALUKA'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span className="font-mono">{r.slug} • L{r.hierarchyLevel}</span>
                      <span>
                        {r.userCount || 0} {isMarathi ? 'वापरकर्ते' : 'users'} •{' '}
                        {r.isWildcard ? 'ALL (*)' : `${r.permissions?.length || 0} perms`}
                      </span>
                    </div>
                  </button>
                );
              }))}
            </div>
          </div>

          {selectedRole && (
            <form
              onSubmit={handleSaveRole}
              className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      {isMarathi ? (selectedRole.nameMr || selectedRole.name) : selectedRole.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedRole.slug}
                    </span>
                    {selectedRole.isWildcard && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Wildcard (*)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isMarathi
                      ? 'येथे बदललेले नाव व सक्रिय स्थिती थेट अधिकारी नोंदणी फॉर्ममध्ये दिसतात.'
                      : 'Editable role names and Active toggle dynamically control what appears in Officer Registration.'}
                  </p>
                </div>

                {canEditSelectedRole && !selectedRole.isSystem && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRole(selectedRole)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isMarathi ? 'हटवा' : 'Delete'}</span>
                  </button>
                )}
              </div>

              {canManageRoles && !canEditSelectedRole && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isMarathi
                      ? 'उच्च किंवा समकक्ष श्रेणीची भूमिका केवळ जिल्हाधिकारी (Superadmin) बदलू शकतात.'
                      : 'Read-only: Equal or higher hierarchy roles can only be edited by Collector (Superadmin).'}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isMarathi ? 'भूमिकेचे नाव (English) *' : 'Role Display Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!canEditSelectedRole}
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isMarathi ? 'भूमिकेचे नाव (मराठी)' : 'Role Display Name (Marathi)'}
                  </label>
                  <input
                    type="text"
                    disabled={!canEditSelectedRole}
                    value={roleForm.nameMr}
                    onChange={(e) => setRoleForm({ ...roleForm, nameMr: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isMarathi ? 'तपशील (Description)' : 'Description'}
                  </label>
                  <input
                    type="text"
                    disabled={!canEditSelectedRole}
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isMarathi ? 'कार्यक्षेत्र पातळी (Jurisdiction Scope)' : 'Jurisdiction Scope'}
                  </label>
                  <select
                    disabled={!canEditSelectedRole || selectedRole.isWildcard}
                    value={roleForm.jurisdictionScope}
                    onChange={(e) => setRoleForm({ ...roleForm, jurisdictionScope: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-60"
                  >
                    {JURISDICTION_SCOPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {isMarathi ? opt.labelMr : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isMarathi ? 'स्तर (1–99)' : 'Level (1–99)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedRole.isWildcard ? 100 : 99}
                      disabled={!canEditSelectedRole || selectedRole.isWildcard}
                      value={roleForm.hierarchyLevel}
                      onChange={(e) => setRoleForm({ ...roleForm, hierarchyLevel: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-60"
                    />
                  </div>
                  <div className="flex items-end pb-1.5">
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!canEditSelectedRole || selectedRole.slug === 'superadmin'}
                        checked={roleForm.isActive}
                        onChange={(e) => setRoleForm({ ...roleForm, isActive: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span>{isMarathi ? 'सक्रिय (नोंदणीमध्ये दिसेल)' : 'Active (Visible in Registration)'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Permission Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    {isMarathi ? 'अधिकार तक्ता (Permission Matrix)' : 'Permission Matrix'}
                  </h4>
                  {selectedRole.isWildcard && (
                    <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {isMarathi ? 'जिल्हाधिकारी (Superadmin) कडे सर्व अधिकार कायम राहतात' : 'Collector (Superadmin) retains all permissions'}
                    </span>
                  )}
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {Object.entries(groupedPermissions).map(([modKey, perms]) => (
                    <div key={modKey} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                      <div className="text-[11px] font-black text-indigo-900">
                        {isMarathi ? MODULE_LABELS[modKey]?.mr || modKey : MODULE_LABELS[modKey]?.en || modKey}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((perm) => {
                          const checked = selectedRole.isWildcard || roleForm.permissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-start gap-2 p-2 rounded-lg border text-xs transition ${
                                checked ? 'bg-white border-indigo-200' : 'bg-slate-50 border-slate-200/60'
                              } ${!canManageRoles || selectedRole.isWildcard ? 'opacity-80 cursor-default' : 'cursor-pointer hover:border-indigo-300'}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={!canEditSelectedRole || selectedRole.isWildcard}
                                onChange={() => toggleRolePermission(perm.key)}
                                className="mt-0.5 w-3.5 h-3.5 text-indigo-600 rounded"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800 leading-tight">
                                  {isMarathi ? perm.labelMr : perm.labelEn}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">{perm.key}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {canEditSelectedRole && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingRole}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingRole ? (isMarathi ? 'जतन होत आहे...' : 'Saving...') : (isMarathi ? 'भूमिका व अधिकार जतन करा' : 'Save Role & Permissions')}</span>
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* SECTION 2: USERS, APPROVALS & JURISDICTION MAPPING */}
      {section === 'users' && canViewUsers && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={isMarathi ? 'नाव, ईमेल, मोबाईल, तालुका किंवा गाव शोधा...' : 'Search name, email, mobile, taluka, village...'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-[11px] font-bold">
                {[
                  { key: 'ALL', label: isMarathi ? `सर्व (${users.length})` : `All (${users.length})` },
                  { key: 'PENDING', label: isMarathi ? `प्रलंबित मंजुरी (${pendingCount})` : `Pending (${pendingCount})` },
                  { key: 'APPROVED', label: isMarathi ? 'मंजूर' : 'Approved' },
                  { key: 'REJECTED', label: isMarathi ? 'नाकारलेले' : 'Rejected' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setUserStatusFilter(tab.key)}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      userStatusFilter === tab.key
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {canManageUsers && (
              <button
                type="button"
                onClick={() => setShowNewUserModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isMarathi ? 'नवीन अधिकारी जोडा' : 'Add Officer Account'}</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">{isMarathi ? 'अधिकारी / ईमेल / मोबाईल' : 'Officer / Email / Mobile'}</th>
                  <th className="py-2.5 px-3">{isMarathi ? 'भूमिका' : 'Role'}</th>
                  <th className="py-2.5 px-3">{isMarathi ? 'कार्यक्षेत्र मॅपिंग' : 'Jurisdiction Mapping'}</th>
                  <th className="py-2.5 px-3">{isMarathi ? 'स्थिती' : 'Status'}</th>
                  {canManageUsers && <th className="py-2.5 px-3 text-right">{isMarathi ? 'कृती' : 'Actions'}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const canEditThisUser =
                    isSuperadmin ||
                    u.id === currentUser?.id ||
                    (!u.isWildcard && (u.hierarchyLevel ?? 50) < (currentUser?.hierarchyLevel ?? 0));
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/60 ${u.approvalStatus === 'PENDING' ? 'bg-amber-50/40' : ''}`}>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                        {u.mobile && (
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" /> {u.mobile}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {isMarathi ? (u.roleNameMr || u.roleName) : u.roleName}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {u.jurisdictionScope || 'TALUKA'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium space-y-0.5 max-w-xs">
                        {u.subdivision && (
                          <div className="text-[11px] font-bold text-indigo-900">
                            {isMarathi ? `उपविभाग: ${u.subdivision}` : `Sub-Div: ${u.subdivision}`}
                          </div>
                        )}
                        <div className="text-[11px]">
                          {u.assignedTalukas?.length > 0
                            ? u.assignedTalukas.join(', ')
                            : (u.taluka || (isMarathi ? 'संपूर्ण जिल्हा' : 'All Talukas'))}
                        </div>
                        {u.assignedCircles?.length > 0 && (
                          <div className="text-[10px] text-teal-800 truncate">
                            {isMarathi ? 'मंडळे: ' : 'Circles: '}
                            {u.assignedCircles.join(', ')}
                          </div>
                        )}
                        {u.assignedVillages?.length > 0 && (
                          <div className="text-[10px] text-slate-500 truncate">
                            {isMarathi ? `गावे (${u.assignedVillages.length}): ` : `Villages (${u.assignedVillages.length}): `}
                            {u.assignedVillages.slice(0, 3).join(', ')}
                            {u.assignedVillages.length > 3 ? ` +${u.assignedVillages.length - 3}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 space-y-1">
                        {u.approvalStatus === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            <Clock className="w-3 h-3" /> {isMarathi ? 'मंजुरी प्रलंबित' : 'Pending Approval'}
                          </span>
                        ) : u.approvalStatus === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" /> {isMarathi ? 'नाकारले' : 'Rejected'}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.isActive ? (isMarathi ? 'सक्रिय' : 'Active') : (isMarathi ? 'निष्क्रिय' : 'Inactive')}
                          </span>
                        )}
                      </td>
                      {canManageUsers && (
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                            {u.approvalStatus === 'PENDING' && isSuperadmin && (
                              <>
                                <button
                                  type="button"
                                  disabled={savingUser}
                                  onClick={() => handleQuickApproveUser(u)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{isMarathi ? 'मंजूर' : 'Approve'}</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={savingUser}
                                  onClick={() => handleQuickRejectUser(u)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                  <span>{isMarathi ? 'नाकारा' : 'Reject'}</span>
                                </button>
                              </>
                            )}
                            {canEditThisUser ? (
                              <button
                                type="button"
                                onClick={() => openEditUser(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-[11px] font-bold cursor-pointer"
                              >
                                <Sliders className="w-3 h-3" />
                                <span>{isMarathi ? 'मॅपिंग / संपादन' : 'Edit & Map'}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium inline-flex items-center gap-1">
                                <Lock className="w-3 h-3" /> {isMarathi ? 'संरक्षित' : 'Protected'}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: AUDIT LOGS */}
      {section === 'audit' && canViewAudit && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-slate-900">
              {isMarathi ? 'सुरक्षा व क्रियाकलाप ऑडिट नोंदी' : 'Governance & RBAC Audit Trail'}
            </h3>
            <input
              type="text"
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              placeholder={isMarathi ? 'कृती किंवा ईमेल शोधा...' : 'Filter by action or email...'}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 w-56"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[460px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2 px-3">{isMarathi ? 'वेळ' : 'Timestamp'}</th>
                  <th className="py-2 px-3">{isMarathi ? 'अधिकारी' : 'Actor'}</th>
                  <th className="py-2 px-3">{isMarathi ? 'कृती' : 'Action'}</th>
                  <th className="py-2 px-3">{isMarathi ? 'घटक' : 'Entity'}</th>
                  <th className="py-2 px-3">{isMarathi ? 'तपशील' : 'Details'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-800">{log.user?.fullName || 'System'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.user?.email || '-'}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-mono text-[10px] font-bold border border-indigo-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[11px] text-slate-700">{log.entityType}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                      {log.newData ? JSON.stringify(log.newData) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CUSTOM ROLE */}
      {showNewRoleModal && (
        <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRole}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                {isMarathi ? 'नवीन सानुकूल भूमिका तयार करा' : 'Create New Custom Role'}
              </h3>
              <button type="button" onClick={() => setShowNewRoleModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Role Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Revenue Inspector"
                    value={newRoleForm.name}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Role Name (Marathi)</label>
                  <input
                    type="text"
                    placeholder="उदा. महसूल निरीक्षक"
                    value={newRoleForm.nameMr}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, nameMr: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Jurisdiction Scope *</label>
                  <select
                    value={newRoleForm.jurisdictionScope}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, jurisdictionScope: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    {JURISDICTION_SCOPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {isMarathi ? opt.labelMr : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Hierarchy Level (1–99)</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={newRoleForm.hierarchyLevel}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, hierarchyLevel: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newRoleForm.description}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black text-slate-800">{isMarathi ? 'अधिकार निवडा' : 'Select Permissions'}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permissions.map((perm) => {
                    const checked = newRoleForm.permissions.includes(perm.key);
                    return (
                      <label key={perm.key} className="flex items-start gap-2 p-2 rounded-lg border border-slate-200 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setNewRoleForm((prev) => ({
                              ...prev,
                              permissions: checked
                                ? prev.permissions.filter((k) => k !== perm.key)
                                : [...prev.permissions, perm.key],
                            }))
                          }
                          className="mt-0.5 w-3.5 h-3.5 text-indigo-600 rounded"
                        />
                        <div>
                          <div className="font-bold text-slate-800">{isMarathi ? perm.labelMr : perm.labelEn}</div>
                          <div className="text-[10px] font-mono text-slate-400">{perm.key}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewRoleModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer">
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </button>
              <button type="submit" disabled={savingRole} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer">
                {savingRole ? '...' : (isMarathi ? 'भूमिका तयार करा' : 'Create Role')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREATE OFFICER ACCOUNT */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                {isMarathi ? 'नवीन अधिकारी खाते तयार करा' : 'Create New Officer Account'}
              </h3>
              <button type="button" onClick={() => setShowNewUserModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">10-Digit Mobile</label>
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={newUserForm.mobile}
                    onChange={(e) => setNewUserForm({ ...newUserForm, mobile: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    required
                    value={newUserForm.roleId || roles.find((r) => r.slug === 'officer')?.id || ''}
                    onChange={(e) => setNewUserForm({ ...newUserForm, roleId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    {roles.filter((r) => r.isActive).map((r) => (
                      <option key={r.id} value={r.id}>
                        {isMarathi ? (r.nameMr || r.name) : r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={newUserForm.designation}
                    onChange={(e) => setNewUserForm({ ...newUserForm, designation: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <JurisdictionMappingFields
                scope={newUserRoleScope}
                subdivision={newUserForm.subdivision}
                taluka={newUserForm.taluka}
                assignedTalukas={newUserForm.assignedTalukas}
                assignedCircles={newUserForm.assignedCircles}
                assignedVillages={newUserForm.assignedVillages}
                onChange={(patch) => setNewUserForm((prev) => ({ ...prev, ...patch }))}
                disabled={false}
                isMarathi={isMarathi}
              />
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewUserModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer">
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </button>
              <button type="submit" disabled={savingUser} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer">
                {savingUser ? '...' : (isMarathi ? 'खाते तयार करा' : 'Create User')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT USER, JURISDICTION MAPPING & PER-USER OVERRIDES */}
      {editingUser && (
        <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={(e) => handleSaveUser(e, false)}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingUser.fullName}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">{editingUser.email}</p>
              </div>
              <button type="button" onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {editingUser.approvalStatus === 'PENDING' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      {isMarathi
                        ? 'हे खाते मंजुरीसाठी प्रलंबित आहे. Superadmin कार्यक्षेत्र तपासून मंजुरी देऊ शकतात.'
                        : 'This officer registration is Pending Approval. Only Superadmin can approve and activate login.'}
                    </span>
                  </div>
                  {isSuperadmin && (
                    <button
                      type="button"
                      disabled={savingUser}
                      onClick={() => handleSaveUser(null, true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isMarathi ? 'मॅपिंगसह मंजूर व सक्रिय करा' : 'Approve & Activate Account'}</span>
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">10-Digit Mobile</label>
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={userForm.mobile}
                    onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={userForm.roleId}
                    onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {isMarathi ? (r.nameMr || r.name) : r.name} {!r.isActive ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={userForm.designation}
                    onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Reset Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Min 8 chars"
                    value={userForm.newPassword}
                    onChange={(e) => setUserForm({ ...userForm, newPassword: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isSuperadmin && editingUser.approvalStatus === 'PENDING'}
                      checked={userForm.isActive}
                      onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span>{isMarathi ? 'खाते सक्रिय (Active)' : 'Account Active'}</span>
                  </label>
                </div>
              </div>

              <JurisdictionMappingFields
                scope={editUserRoleScope}
                subdivision={userForm.subdivision}
                taluka={userForm.taluka}
                assignedTalukas={userForm.assignedTalukas}
                assignedCircles={userForm.assignedCircles}
                assignedVillages={userForm.assignedVillages}
                onChange={(patch) => setUserForm((prev) => ({ ...prev, ...patch }))}
                disabled={!isSuperadmin}
                isMarathi={isMarathi}
              />

              {/* Per-User Custom Overrides */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    {isMarathi ? 'वैयक्तिक विशेष अधिकार (Custom Permission Overrides)' : 'Per-User Custom Permission Overrides'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isMarathi
                      ? 'भूमिकेव्यतिरिक्त या वापरकर्त्याला डेटा संपादन किंवा गुगल ड्राइव्ह सिंकसारखे विशेष अधिकार द्या किंवा काढून घ्या.'
                      : 'Grant or revoke individual permissions (e.g., parcel.edit or drive.push) for this specific officer.'}
                  </p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {permissions.map((perm) => {
                    const selectedRoleForUser = roles.find((r) => r.id === userForm.roleId);
                    const inherited =
                      selectedRoleForUser?.isWildcard ||
                      selectedRoleForUser?.permissions?.includes(perm.key);
                    const ov = userForm.overrides.find((o) => o.key === perm.key);
                    const state = ov ? ov.effect : 'INHERIT';

                    return (
                      <div
                        key={perm.key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800">
                            {isMarathi ? perm.labelMr : perm.labelEn}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {perm.key} •{' '}
                            <span className={inherited ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                              {inherited ? (isMarathi ? 'भूमिकेतून अनुमत' : 'Role: Allow') : (isMarathi ? 'भूमिकेतून बंद' : 'Role: Deny')}
                            </span>
                          </div>
                        </div>

                        <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5 shrink-0">
                          {[
                            { val: 'INHERIT', label: isMarathi ? 'डीफॉल्ट' : 'Inherit' },
                            { val: 'GRANT', label: isMarathi ? '+ अनुमती' : '+ Grant' },
                            { val: 'REVOKE', label: isMarathi ? '- नाकारा' : '- Revoke' },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => setOverrideEffect(perm.key, opt.val)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                                state === opt.val
                                  ? opt.val === 'GRANT'
                                    ? 'bg-emerald-600 text-white'
                                    : opt.val === 'REVOKE'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-indigo-600 text-white'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer">
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </button>
              <button type="submit" disabled={savingUser} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer">
                {savingUser ? '...' : (isMarathi ? 'बदल जतन करा' : 'Save User Changes')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
