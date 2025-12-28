import { RouterProvider, Route, Navigate, Outlet, createHashRouter, createRoutesFromElements } from 'react-router-dom';

import Home from './pages/Home';
import ItemPage, { loader as itemPageLoader } from './pages/ItemPage';
import ItemNotFound from './pages/ItemNotFound';
import Header from './components/Header';
import Footer from './components/Footer';

function RootLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

const router = createHashRouter(createRoutesFromElements(
  <Route path="/" element={<RootLayout />}>
    <Route index element={<Home />} />
    <Route path="/about" element={<div>About Page</div>} />
    <Route path="/potions" element={<div>Potions Page</div>} />
    <Route 
      path="/item/:itemId" 
      element={<ItemPage />}
      loader={itemPageLoader}
      errorElement={<ItemNotFound />}
    />
    <Route path="*" element={<Navigate to="/" replace/>} />
  </Route>
))

export default function App() {
  return (
    <RouterProvider router={router}/>
  )
}