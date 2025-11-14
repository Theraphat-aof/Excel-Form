// Sidebar.jsx
import { Link } from "react-router-dom";
import styles from "../Styles/Sidebar.module.css";

const Sidebar = () => {
  const menuItems = [
    { name: "Leave Form", path: "/leave-form" },
    { name: "โปรไฟล์", path: "/profile" },
    { name: "การตั้งค่า", path: "/settings" },
    { name: "ออกจากระบบ", path: "/logout" },
  ];

  return (
    <div className={styles.sidebar}>
      <ul className={styles.navList}>
        {menuItems.map((item, index) => (
          <li key={index} className={styles.navItem}>
            <Link to={item.path} className={styles.navLink}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
