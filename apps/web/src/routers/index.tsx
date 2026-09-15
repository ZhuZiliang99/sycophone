import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '../pages/home'
import { paths } from './paths'


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={paths.home} element={<HomePage />} />
            </Routes>
        </BrowserRouter>
    )
}