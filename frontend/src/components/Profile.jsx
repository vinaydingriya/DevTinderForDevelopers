import { useSelector } from "react-redux"
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector(store => store.user);
  return (
    <div className="h-full">
      {user?.data && <EditProfile user={user} />}
    </div>
  )
}

export default Profile