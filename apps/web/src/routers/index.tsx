import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { HomePage } from '../pages/home'
import { paths } from './paths'
import { Workshop } from '@/pages/workshop'
import { Turntable } from '@/layouts/nav/Turntable'


function NavLayout() {
    return (
        <div className="flex h-full w-full min-h-0 flex-col overflow-hidden bg-black">
            <div className="min-h-0 flex-1 overflow-hidden">
                <Outlet />
            </div>
            <Turntable menuItems={[]} />
        </div>
    )
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={paths.home} element={<HomePage />} />
                <Route element={<NavLayout />}>
                    <Route path={paths.workshop} element={<Workshop />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}