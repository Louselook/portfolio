import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import Footer from './Footer';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <div className={styles.shell}>
      <Nav />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
