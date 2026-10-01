import { useEffect, useRef } from "react";
import {
    ACESFilmicToneMapping,
    AmbientLight,
    Clock,
    DirectionalLight,
    Mesh,
    Object3D,
    PerspectiveCamera,
    Scene,
    Texture,
    WebGLRenderer,
    type Material,
} from "three";
import { createVinylDisc } from "./VinylDisc";

interface MenuItem {
    label: string;
    route: string;
}

interface TurntableProps {
    menuItems: MenuItem[];
}


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
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const box = canvas.parentElement;
        if (!box) return;
        const scene = new Scene();
        const camera = new PerspectiveCamera(32, 1, 0.1, 100);
        camera.up.set(0, 0, 1);
        camera.position.set(0, 7.2, 1.55);
        camera.lookAt(0, 0, 0);
        const renderer = new WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x0d0f0e);
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;

        scene.add(new AmbientLight(0xfff4e6, 0.45));
        const key = new DirectionalLight(0xfff7ee, 2.4);
        key.position.set(2.2, 5.5, 6);
        const fill = new DirectionalLight(0xb9c7e8, 0.7);
        fill.position.set(-4, -2, 3);
        scene.add(key, fill);

        const { root, spinner } = createVinylDisc();
        scene.add(root);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const spin = (33.333 / 60) * Math.PI * 2;
        const clock = new Clock();

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
        const animate = () => {
            const dt = clock.getDelta();
            if (!reduce) spinner.rotation.y += dt * spin;
            renderer.render(scene, camera);
            frame = requestAnimationFrame(animate);
        }
        animate();
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
            disposeObject(scene);
            camera.dispose();
            renderer.dispose();
        }
    }, [])


    return (
        <div className="h-1/2 w-full min-h-0 shrink-0 overflow-hidden">
            <canvas ref={canvasRef} className="block h-full w-full" />
        </div>
    )
}