import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { useLanguage } from './context/LanguageContext.jsx';

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminOffers = lazy(() => import('./pages/admin/AdminOffers.jsx'));
const AdminDiscountCodes = lazy(() => import('./pages/admin/AdminDiscountCodes.jsx'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.jsx'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'));

const Home = lazy(() => import('./pages/Home.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetails = lazy(() => import('./pages/ProductDetails.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const MyOrders = lazy(() => import('./pages/MyOrders.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const CareGuide = lazy(() => import('./pages/CareGuide.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const Returns = lazy(() => import('./pages/Returns.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function StoreShell({ children }) {
  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function PageFallback() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <div className="container-soft flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label={t('loading')} />
      </div>
    </div>
  );
}

function StorePage({ children }) {
  return <StoreShell>{children}</StoreShell>;
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="discount-codes" element={<AdminDiscountCodes />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="/" element={<StorePage><Home /></StorePage>} />
          <Route path="/shop" element={<StorePage><Shop /></StorePage>} />
          <Route path="/products/:slug" element={<StorePage><ProductDetails /></StorePage>} />
          <Route path="/cart" element={<StorePage><Cart /></StorePage>} />
          <Route path="/checkout" element={<StorePage><Checkout /></StorePage>} />
          <Route path="/order-success/:id" element={<StorePage><OrderSuccess /></StorePage>} />
          <Route path="/login" element={<StorePage><Login /></StorePage>} />
          <Route path="/signup" element={<StorePage><Signup /></StorePage>} />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <StorePage><MyOrders /></StorePage>
              </ProtectedRoute>
            }
          />

          <Route path="/about" element={<StorePage><About /></StorePage>} />
          <Route path="/contact" element={<StorePage><Contact /></StorePage>} />
          <Route path="/care-guide" element={<StorePage><CareGuide /></StorePage>} />
          <Route path="/privacy-policy" element={<StorePage><PrivacyPolicy /></StorePage>} />
          <Route path="/terms" element={<StorePage><Terms /></StorePage>} />
          <Route path="/returns" element={<StorePage><Returns /></StorePage>} />

          <Route path="*" element={<StorePage><NotFound /></StorePage>} />
        </Routes>
      </Suspense>
    </>
  );
}