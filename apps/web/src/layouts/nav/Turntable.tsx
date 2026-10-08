import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ACESFilmicToneMapping,
    AmbientLight,
    DirectionalLight,
    Mesh,
    Object3D,
    PerspectiveCamera,
    PMREMGenerator,
    Scene,
    Texture,
    Vector3,
    WebGLRenderer,
    type Material,
    type MeshStandardMaterial,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createVinylDisc } from "./VinylDisc";
import { createTonearm } from "./Tonearm";

interface MenuItem {
    label: string;
    route: string;
}

interface TurntableProps {
    menuItems: MenuItem[];
}

/** 唱盘中心（与 VinylDisc 的摆放一致） */
const DISC_CENTER = { x: 2, y: 0 };
/**
 * 唱臂枢轴：唱片屏幕方向的右下方、盘缘之外一点。
 * y 足够大，底座/立柱/枢轴都沉在画面底边之下，只露臂管与针尖。
 */
const PIVOT = new Vector3(-1.0, 2.6, 0);
/**
 * 菜单按钮的唱臂扫掠角（度）：按钮直接锚在针尖落点上。
 * 针尖只能落在"以枢轴为圆心、臂长为半径"的圆上，扫掠段很浅，
 * 投影到屏幕后近似一条水平线。
 */
const SWEEP = { from: -84, to: -52 };

function disposeObject(object: Object3D) {
    for (const child of object.children) {
      disposeObject(child);
    }
    const mesh = object as Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material as Material | Material[] | undefined;
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    for (const item of materials) {
      for (const value of Object.values(item)) {
        if (value && (value as Texture).isTexture) {
          (value as Texture).dispose();
        }
      }
      item.dispose();
    }
  }


export function Turntable({ menuItems }: TurntableProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const location = useLocation();
    const navigate = useNavigate();

    // 当前路由对应的菜单项（唱针初始与导航目标都以它为准）
    const activeIndex = Math.max(
        0,
        menuItems.findIndex((item) => item.route === location.pathname),
    );
    const activeRef = useRef(activeIndex);
    activeRef.current = activeIndex;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const box = canvas.parentElement;
        if (!box) return;
        const scene = new Scene();
        const camera = new PerspectiveCamera(32, 1, 0.1, 100);
        camera.up.set(0, 0, 1);
        camera.position.set(0, 3.5, 1.4);
        camera.lookAt(0, 0, 0);
        const renderer = new WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000);
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;

        // 暖黄灯光：主光蜜色、补光橙、轮廓光奶白
        scene.add(new AmbientLight(0xffd9a8, 0.5));
        const key = new DirectionalLight(0xffc97e, 2.2);
        key.position.set(2.2, 5.5, 6);
        const fill = new DirectionalLight(0xff9e5e, 0.45);
        fill.position.set(-5, -2.5, 2.5);
        const rim = new DirectionalLight(0xfff3d6, 0.8);
        rim.position.set(-2, -4, 4);
        scene.add(key, fill, rim);

        // 环境反射：金属的磨砂质感来源；低强度，避免白色环境光冲淡暖调
        const pmrem = new PMREMGenerator(renderer);
        const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = envRT.texture;
        scene.environmentIntensity = 0.3;
        pmrem.dispose();

        const disc = createVinylDisc();
        disc.root.position.set(DISC_CENTER.x, DISC_CENTER.y, 0);
        scene.add(disc.root);
        const spin = (33.333 / 60) * Math.PI * 2;

        // 唱臂：钉在枢轴上，底座留在画面右下角外
        const tonearm = createTonearm();
        tonearm.root.position.copy(PIVOT);
        scene.add(tonearm.root);
        const tipMaterial = tonearm.tip.material as MeshStandardMaterial;

        // 每个菜单项：唱臂目标角（SWEEP 均分）
        const targets = menuItems.map((_, index) => {
            const t = menuItems.length <= 1 ? 0 : index / (menuItems.length - 1);
            return ((SWEEP.from + (SWEEP.to - SWEEP.from) * t) * Math.PI) / 180;
        });
        // 按钮锚点 = 针尖真实落点：把唱臂转到目标角、落臂状态，直接从场景图取针尖世界坐标
        const labelPositions = targets.map((angle) => {
            tonearm.aim.rotation.z = angle;
            tonearm.lift.rotation.y = 0;
            tonearm.root.updateMatrixWorld(true);
            return tonearm.tip.getWorldPosition(new Vector3());
        });

        const resize = () => {
            const width = box.clientWidth;
            const height = box.clientHeight;
            renderer.setSize(width, height, false);
            camera.aspect = width / Math.max(height, 1);
            camera.updateProjectionMatrix();
        }
        resize();
        window.addEventListener('resize', resize);
        let frame = 0;
        let previousTimestamp: number | undefined;
        let armAngle = targets[activeRef.current] ?? 0;
        let armVelocity = 0;
        // 抬臂俯仰：down → lifting → turning → dropping → down
        const MAX_LIFT = 0.11;
        let lift = 0;
        let liftState: "down" | "lifting" | "turning" | "dropping" = "down";
        const projected = new Vector3();
        const animate = (timestamp: number) => {
            const dt = previousTimestamp === undefined
                ? 0
                : Math.min((timestamp - previousTimestamp) / 1000, 0.1);
            previousTimestamp = timestamp;
            disc.spinner.rotation.y += dt * spin;

            // 唱针三段动作：先抬臂，再阻尼弹簧转向，到位后落针
            const target = targets[activeRef.current] ?? armAngle;
            const diff = target - armAngle;
            const needsTurn = Math.abs(diff) > 0.01 || Math.abs(armVelocity) > 0.02;
            if (needsTurn && (liftState === "down" || liftState === "dropping")) {
                liftState = "lifting";
            }
            if (liftState === "lifting") {
                lift = Math.min(lift + dt * 0.45, MAX_LIFT);
                if (lift >= MAX_LIFT) liftState = "turning";
            } else if (liftState === "turning") {
                armVelocity += diff * 14 * dt - armVelocity * 6 * dt;
                armAngle += armVelocity * dt;
                if (!needsTurn) liftState = "dropping";
            } else if (liftState === "dropping") {
                lift = Math.max(lift - dt * 0.3, 0);
                if (lift <= 0) liftState = "down";
            }
            tonearm.aim.rotation.z = armAngle;
            tonearm.lift.rotation.y = -lift;
            // 抬起的针尖更亮
            tipMaterial.emissiveIntensity = 1.6 + lift * 10;

            // 把菜单标签的 3D 位置投影到屏幕，钉住 HTML 按钮
            labelPositions.forEach((position, index) => {
                const el = buttonRefs.current[index];
                if (!el) return;
                projected.copy(position).project(camera);
                el.style.opacity = projected.z < 1 ? "1" : "0";
                el.style.left = `${(projected.x * 0.5 + 0.5) * 100}%`;
                el.style.top = `${(-projected.y * 0.5 + 0.55) * 100}%`;
            });

            renderer.render(scene, camera);
            frame = requestAnimationFrame(animate);
        }
        frame = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
            disposeObject(scene);
            envRT.dispose();
            camera.dispose();
            renderer.dispose();
        }
    }, [menuItems])


    return (
        <div className="relative h-1/2 w-full min-h-0 shrink-0 overflow-hidden">
            <canvas ref={canvasRef} className="block h-full w-full" />

            <div className="pointer-events-none absolute inset-0">
                {menuItems.map((item, index) => {
                    const active = index === activeIndex;
                    return (
                        <button
                            key={item.route}
                            ref={(el) => { buttonRefs.current[index] = el; }}
                            type="button"
                            onClick={() => navigate(item.route)}
                            style={{ opacity: 0 }}
                            className={[
                                "pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.28em] transition-colors duration-200",
                                active
                                    ? "border-[#dfff61] bg-[#0d0f0e]/85 text-[#dfff61] shadow-[0_0_14px_rgba(223,255,97,0.3)]"
                                    : "border-[#55605a]/80 bg-[#0d0f0e]/75 text-[#eee9dc]/70 hover:border-[#eee9dc]/90 hover:text-[#eee9dc]",
                            ].join(" ")}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    )
}
