import { Routes } from "@/app/constants";
import { useAuth } from "@/app/hooks";
import { Link } from "@/modules/Router";

const HomePage = () => {
  const { logout } = useAuth();
  const handleLogout = async () => {
    logout();
  };
  return (
    <div>
      <h1>Home Page</h1>
      <ul>
        <li>
          <Link to={Routes.editor}>Code</Link>
        </li>
        <li>
          <Link to={Routes.matchList}>Matches</Link>
        </li>
        <li>
          <Link to={Routes.ranking}>Ranking</Link>
        </li>
        <li onClick={handleLogout}>Logout</li>
      </ul>
    </div>
  );
};

export { HomePage };
