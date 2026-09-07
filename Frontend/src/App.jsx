import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute, CustomerRoute, GuestRoute } from './auth/guards.jsx';
import { paths } from './lib/paths.js';
import WelcomePage from './pages/WelcomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import OtpPage from './pages/OtpPage.jsx';
import HomePage from './pages/customer/HomePage.jsx';
import ProductPage from './pages/customer/ProductPage.jsx';
import CartPage from './pages/customer/CartPage.jsx';
import AddressFormPage from './pages/customer/AddressFormPage.jsx';
import AddressesPage from './pages/customer/AddressesPage.jsx';
import CheckoutPage from './pages/customer/CheckoutPage.jsx';
import PaymentPage from './pages/customer/PaymentPage.jsx';
import PaymentFailedPage from './pages/customer/PaymentFailedPage.jsx';
import OrderSuccessPage from './pages/customer/OrderSuccessPage.jsx';
import OrdersPage from './pages/customer/OrdersPage.jsx';
import OrderDetailPage from './pages/customer/OrderDetailPage.jsx';
import ProfilePage from './pages/customer/ProfilePage.jsx';
import HelpPage from './pages/customer/HelpPage.jsx';
import FarmerLoginPage from './pages/farmer/FarmerLoginPage.jsx';
import FarmerOtpPage from './pages/farmer/FarmerOtpPage.jsx';
import FarmerDashboardPage from './pages/farmer/FarmerDashboardPage.jsx';
import FarmerProductsPage from './pages/farmer/FarmerProductsPage.jsx';
import FarmerProductFormPage from './pages/farmer/FarmerProductFormPage.jsx';
import FarmerOrdersPage from './pages/farmer/FarmerOrdersPage.jsx';
import FarmerOrderDetailPage from './pages/farmer/FarmerOrderDetailPage.jsx';
import FarmerProfilePage from './pages/farmer/FarmerProfilePage.jsx';

function Guest(page) {
  return <GuestRoute>{page}</GuestRoute>;
}

function Customer(page) {
  return <CustomerRoute>{page}</CustomerRoute>;
}

function Admin(page) {
  return <AdminRoute>{page}</AdminRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path={paths.welcome} element={Guest(<WelcomePage />)} />
      <Route path={paths.login} element={Guest(<LoginPage />)} />
      <Route path={paths.register} element={Guest(<RegisterPage />)} />
      <Route path={paths.otp} element={Guest(<OtpPage />)} />
      <Route path={paths.home} element={Customer(<HomePage />)} />
      <Route path="/products/:id" element={Customer(<ProductPage />)} />
      <Route path={paths.cart} element={Customer(<CartPage />)} />
      <Route path={paths.checkout} element={Customer(<CheckoutPage />)} />
      <Route path={paths.addressNew} element={Customer(<AddressFormPage />)} />
      <Route path="/addresses/:id/edit" element={Customer(<AddressFormPage />)} />
      <Route path={paths.payment} element={Customer(<PaymentPage />)} />
      <Route path={paths.paymentFailed} element={Customer(<PaymentFailedPage />)} />
      <Route path={paths.orderSuccess} element={Customer(<OrderSuccessPage />)} />
      <Route path={paths.orders} element={Customer(<OrdersPage />)} />
      <Route path="/orders/:id" element={Customer(<OrderDetailPage />)} />
      <Route path={paths.profile} element={Customer(<ProfilePage />)} />
      <Route path={paths.addresses} element={Customer(<AddressesPage />)} />
      <Route path={paths.help} element={Customer(<HelpPage />)} />
      <Route path={paths.farmerLogin} element={Guest(<FarmerLoginPage />)} />
      <Route path={paths.farmerOtp} element={Guest(<FarmerOtpPage />)} />
      <Route path={paths.farmerDashboard} element={Admin(<FarmerDashboardPage />)} />
      <Route path={paths.farmerHarvest} element={Admin(<FarmerDashboardPage />)} />
      <Route path={paths.farmerProducts} element={Admin(<FarmerProductsPage />)} />
      <Route path={paths.farmerProductNew} element={Admin(<FarmerProductFormPage />)} />
      <Route path="/farmer/products/:id/edit" element={Admin(<FarmerProductFormPage />)} />
      <Route path={paths.farmerOrders} element={Admin(<FarmerOrdersPage />)} />
      <Route path="/farmer/orders/:id" element={Admin(<FarmerOrderDetailPage />)} />
      <Route path={paths.farmerProfile} element={Admin(<FarmerProfilePage />)} />
      <Route path="*" element={<Navigate to={paths.welcome} replace />} />
    </Routes>
  );
}
