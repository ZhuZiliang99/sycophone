import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { HomePage } from '../pages/home'
import { paths } from './paths'
import { Workshop } from '@/pages/workshop'
import { Turntable } from '@/layouts/nav/Turntable'

// 模块级常量：引用稳定，Turntable 的 three 场景不会因重渲染而重建
const NAV_ITEMS = [
    { label: '分析', route: paths.workshop },
    { label: '项目', route: paths.projects },
    { label: '历史', route: paths.history },
    { label: '特效', route: paths.effects },
    { label: 'VIP', route: paths.vip },
]

function SectionStub({ title }: { title: string }) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-black">
            <p className="font-serif text-2xl italic tracking-[0.2em] text-[#eee9dc]/50">
                {title} · 施工中
            </p>
        </div>
    )
}

function NavLayout() {
    return (
        <div className="flex h-full w-full min-h-0 flex-col overflow-hidden bg-black">
            <div className="min-h-0 flex-1 overflow-hidden">
                <Outlet />
            </div>
            <Turntable menuItems={NAV_ITEMS} />
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
                    <Route path={paths.projects} element={<SectionStub title="项目" />} />
                    <Route path={paths.history} element={<SectionStub title="历史" />} />
                    <Route path={paths.effects} element={<SectionStub title="特效" />} />
                    <Route path={paths.vip} element={<SectionStub title="VIP" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
