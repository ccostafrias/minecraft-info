import { lazy } from 'react';
import { RouterProvider, Route, Navigate, Outlet, createHashRouter, createRoutesFromElements } from 'react-router-dom';
import Home from './pages/Home';
import ItemPage, { loader as itemPageLoader } from './pages/ItemPage';
import ItemNotFound from './pages/ItemNotFound';
import Header from './components/Header';
import Footer from './components/Footer';

// import Entities from './pages/Entities';
const Entities = lazy(() => import('./pages/Entities'));

function getLastVisitedItemId() {
  const raw = sessionStorage.getItem('lastVisitedItem')
  const id = raw !== null ? Number(raw) : NaN
  return Number.isFinite(id) && id >= 0 ? id : 0
}

function RedirectToLastItem() {
  const id = getLastVisitedItemId()
  return <Navigate to={`/item/${id}`} replace />
}

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

    <Route path="/item" element={<RedirectToLastItem />} />
    <Route path="/entity" element={<Navigate to={`/entity/2`} replace />} />

    <Route 
      path="/entity/:entityId" 
      element={<Entities />}
    />
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