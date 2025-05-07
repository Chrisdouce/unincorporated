// src/pages/PersonalPageWrapper.tsx
import { useParams } from "react-router-dom";
import PersonalPage from "../pages/Personal-Page";

const PersonalPageWrapper = () => {
  const { userId } = useParams();
  if (!userId) return <div>User ID not found</div>;

  return <PersonalPage openedUserId={userId} />;
};

export default PersonalPageWrapper;