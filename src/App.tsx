import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot/Chatbot'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import { CartProvider } from './context/CartContext'
import './styles/global.css'
import './styles/components.css'

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
      <Footer />
      <Chatbot />
    </CartProvider>
  )
}
