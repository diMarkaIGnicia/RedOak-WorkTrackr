import React from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, avatarUrl }) => (
  <div className="flex items-center gap-2">
    {avatarUrl ? (
      <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center font-bold">
        {name.charAt(0)}
      </div>
    )}
    <span className="text-sm font-medium">{name}</span>
  </div>
);

export default UserAvatar;
