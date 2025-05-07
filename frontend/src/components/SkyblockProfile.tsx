import React, { useEffect, useState } from 'react';

interface SkyblockProfileData {
  cute_name: string;
  members: {
    [uuid: string]: {
      coins_purse: number;
    };
  };
}

const SkyblockProfile = ({ uuid }: { uuid: string }) => {
  const [profile, setProfile] = useState<SkyblockProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/skyblock/${uuid}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Unknown error');
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
      }
    };

    fetchProfile();
  }, [uuid]);

  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Loading...</div>;

  const memberData = profile;
  console.log(memberData);
  const rawUuid = uuid.replace(/-/g, '');
  console.log(rawUuid);
  const coinPurse = profile.members[rawUuid].currencies.coin_purse;
  console.log(coinPurse);

  return (
    <div>
      <h2>SkyBlock Profile: {profile.cute_name}</h2>
      <p>Coins in Purse: {coinPurse?.toLocaleString() ?? 'N/A'}</p>
    </div>
  );
};

export default SkyblockProfile;
