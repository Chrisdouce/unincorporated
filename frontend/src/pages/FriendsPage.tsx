import { JSX, useState } from "react";
import PersonalPage from "../pages/Personal-Page";
import { useUser } from "../context/UserContext";
import { useEffect } from "react";

export default function FriendsPage(): JSX.Element {
    const { token, logout } = useUser();
    const [friends, setFriends] = useState<{ friendAId: string }[]>([]);

    useEffect(() => {
        if (!token) {
            logout();
            return;
        }
    
        const fetchUserData = async () => {
            try {
                const userId = JSON.parse(atob(token.split('.')[1])).userId;
    
                const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/friends`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
    
                if (res.status === 401) {
                    logout();
                    return;
                }
    
                const data = await res.json();
                data.forEach((friendship: { friendAId: string, friendBId: string }) => {
                    if (friendship.friendAId === userId) {
                        friendship.friendAId = friendship.friendBId;
                    } else {
                        friendship.friendBId = friendship.friendAId;
                    }
                });
                setFriends(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
                logout();
            }
        };
    
        fetchUserData();
    }, [token, logout]);
    

    return (
        friends.length > 0 ? (
            <div>
                {friends.map((friend) => (
                    <PersonalPage key={friend.friendAId} openedUserId={friend.friendAId} />
                ))}
            </div>
        ) : (
            <p>No friends found.</p>
        )
    );
}