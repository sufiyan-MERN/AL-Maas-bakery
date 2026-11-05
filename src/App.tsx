import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot/Chatbot'
import CartDrawer from './components/CartDrawer'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import { ToastProvider } from './context/ToastContext'
import { ProductProvider } from './context/ProductContext'
import { CartProvider } from './context/CartContext'
import './styles/global.css'
import './styles/components.css'

export default function App() {
  return (
    <ToastProvider>
      <ProductProvider>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
          </Routes>
          <Footer />
          <Chatbot />
        </CartProvider>
      </ProductProvider>
    </ToastProvider>
  )
}
