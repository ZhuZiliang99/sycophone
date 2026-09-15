import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '../pages/home'
import { paths } from './paths'
import { Workshop} from '../pages/workshop'

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={paths.home} element={<HomePage />} />
                <Route path={paths.workshop} element={<Workshop />} />
            </Routes>
        </BrowserRouter>
    )
}