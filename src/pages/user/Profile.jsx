import { Camera } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import useAuthStore from '../../store/authStore';
import { assetUrl, initials, unwrap } from '../../utils/music';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(user);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/me');
      const data = unwrap(response);
      setProfile(data);
      setName(data.name || '');
      updateUser(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load profile');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const response = await api.put('/users/me', { name });
      const data = unwrap(response);
      setProfile(data);
      updateUser(data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update profile');
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await api.put('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const data = unwrap(response);
      setProfile((current) => ({ ...current, ...data }));
      updateUser({ ...profile, ...data });
      toast.success('Avatar updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not upload avatar');
    }
  };

  if (loading) return <Loader label="Loading profile" />;

  return (
    <section className="page">
      <PageHeader eyebrow="Profile" title="Tune your identity" description="Keep your listener profile current." />
      <div className="profile-card">
        <div className="profile-avatar">
          {profile?.profilePic ? <img src={assetUrl(profile.profilePic)} alt="" /> : <span>{initials(profile?.name)}</span>}
          <label className="avatar-upload">
            <Camera size={17} />
            <input type="file" accept="image/*" onChange={uploadAvatar} />
          </label>
        </div>
        <form className="form-stack profile-form" onSubmit={saveProfile}>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Email
            <input value={profile?.email || ''} disabled />
          </label>
          <label>
            Role
            <input value={profile?.role || 'user'} disabled />
          </label>
          <button className="primary-button" type="submit">Save profile</button>
        </form>
      </div>
    </section>
  );
};

export default Profile;
