import Navbar from '../component/Navbar'
import Footer from '../component/Footer'

export default function UserLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
}
