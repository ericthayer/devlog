import React, { useEffect, useState } from 'react';
import { Users, Shield, Trash2, RefreshCw } from 'lucide-react';
import { getAllUsers, updateUserRole, deleteUser } from '../services/dbService';
import { UserRole } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { Toast } from './Toast';

interface UserWithRole {
  user_id: string;
  email: string;
  role: UserRole | null;
  created_at: string;
  publisher_requested: boolean;
}

interface UserManagementViewProps {
  canEdit: boolean;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ canEdit }) => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      // Extract specific error message from Supabase error
      const errorMsg = error?.message || error?.error_description || 'Unknown error';
      
      if (errorMsg.includes('Authentication required')) {
        setErrorMessage('Please sign in to view users.');
      } else if (errorMsg.includes('super_admin')) {
        setErrorMessage('Only super admin users can manage users. Your current role may not have permission.');
      } else if (errorMsg.includes('User role not found')) {
        setErrorMessage('Your user role is not configured. Please contact an administrator.');
      } else {
        setErrorMessage(`Failed to load users: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: UserRole | null) => {
    if (!canEdit) {
      setErrorMessage('You do not have permission to update user roles.');
      return;
    }

    setUpdatingUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Cycle: null/reader → publisher → reader
      let newRole: UserRole;
      if (currentRole === 'publisher') {
        newRole = 'reader';
      } else {
        newRole = 'publisher';
      }

      await updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(u => 
        u.user_id === userId ? { ...u, role: newRole } : u
      ));
      
      setSuccessMessage(`User role updated to ${newRole}`);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      setErrorMessage(`Failed to update role: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!canEdit) {
      setErrorMessage('You do not have permission to delete users.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove the role for ${email}? This will not delete their account.`
    );

    if (!confirmed) return;

    setUpdatingUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteUser(userId);
      
      // Remove from local state
      setUsers(users.filter(u => u.user_id !== userId));
      
      setSuccessMessage(`Removed role for ${email}`);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      setErrorMessage(`Failed to delete user: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black p-8 max-w-md text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You do not have permission to access user management. 
            This feature is only available to super administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-black sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage user roles and permissions
                </p>
              </div>
            </div>
            <BrutalistButton
              onClick={loadUsers}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </BrutalistButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white border-4 border-black p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-black border-t-yellow-400 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white border-4 border-black p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2">No users found</h3>
            <p className="text-gray-600">No users with roles exist yet.</p>
          </div>
        ) : (
          <div className="bg-white border-4 border-black">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b-4 border-black bg-yellow-400 font-bold">
              <div className="col-span-5">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Requested</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Table Body */}
            {users.map((user, index) => (
              <div
                key={user.user_id}
                className={`grid grid-cols-12 gap-4 p-4 items-center ${
                  index !== users.length - 1 ? 'border-b-2 border-black' : ''
                }`}
              >
                {/* Email */}
                <div className="col-span-5 font-mono text-sm truncate">
                  {user.email || 'No email'}
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <span
                    className={`inline-block px-3 py-1 border-2 border-black font-bold text-xs uppercase ${
                      user.role === 'super_admin'
                        ? 'bg-red-400'
                        : user.role === 'publisher'
                        ? 'bg-blue-400'
                        : user.role === 'reader'
                        ? 'bg-green-400'
                        : 'bg-gray-300'
                    }`}
                  >
                    {user.role || 'none'}
                  </span>
                </div>

                {/* Publisher Requested */}
                <div className="col-span-2">
                  {user.publisher_requested && (
                    <span className="inline-block px-2 py-1 bg-yellow-200 border-2 border-black text-xs font-bold">
                      Requested
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-3 flex justify-end gap-2">
                  {user.role !== 'super_admin' && (
                    <>
                      <BrutalistButton
                        onClick={() => handleRoleToggle(user.user_id, user.role)}
                        variant="outline"
                        size="sm"
                        disabled={updatingUserId === user.user_id}
                      >
                        {updatingUserId === user.user_id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            {user.role === 'publisher' ? 'Make Reader' : 'Make Publisher'}
                          </>
                        )}
                      </BrutalistButton>
                      <BrutalistButton
                        onClick={() => handleDeleteUser(user.user_id, user.email || 'this user')}
                        variant="outline"
                        size="sm"
                        disabled={updatingUserId === user.user_id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </BrutalistButton>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white border-4 border-black p-4">
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'super_admin').length}
            </div>
            <div className="text-sm text-gray-600">Super Admins</div>
          </div>
          <div className="bg-white border-4 border-black p-4">
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'publisher').length}
            </div>
            <div className="text-sm text-gray-600">Publishers</div>
          </div>
          <div className="bg-white border-4 border-black p-4">
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'reader').length}
            </div>
            <div className="text-sm text-gray-600">Readers</div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      {errorMessage && (
        <Toast
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage(null)}
        />
      )}
      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
};
