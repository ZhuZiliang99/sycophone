import {
    CanvasTexture,
    CylinderGeometry,
    Group,
    Mesh,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    SRGBColorSpace,
} from "three";

const RADIUS = 3.2;

function circleTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 2048) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context missing");
    draw(ctx, size);
    const texture = new CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
}

function grooveTextures() {
    const map = circleTexture((ctx, size) => {
        const cx = size / 2;
        const sheen = ctx.createRadialGradient(cx * 0.92, cx * 0.88, size * 0.02, cx, cx, size * 0.5);
        sheen.addColorStop(0, "#3a3a3a");
        sheen.addColorStop(0.35, "#121212");
        sheen.addColorStop(0.72, "#070707");
        sheen.addColorStop(1, "#242424");
        ctx.fillStyle = sheen;
        ctx.fillRect(0, 0, size, size);

        for (let r = size * 0.18; r < size * 0.47; r += 1.6) {
            const band = Math.floor(r) % 9;
            ctx.strokeStyle = band === 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)";
            ctx.lineWidth = band === 0 ? 1.4 : 0.7;
            ctx.beginPath();
            ctx.arc(cx, cx, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.strokeStyle = "#4a4a4a";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cx, size * 0.478, 0, Math.PI * 2);
        ctx.stroke();
    });
    map.colorSpace = SRGBColorSpace;

    const bump = circleTexture((ctx, size) => {
        const cx = size / 2;
        ctx.fillStyle = "#808080";
        ctx.fillRect(0, 0, size, size);
        for (let r = size * 0.18; r < size * 0.47; r += 2.4) {
            ctx.strokeStyle = Math.floor(r / 2.4) % 2 === 0 ? "#d0d0d0" : "#303030";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx, cx, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }, 1024);

    return { map, bump };
}

function labelTexture() {
    const map = circleTexture((ctx, size) => {
        const cx = size / 2;
        // 底色：站点同款近黑绿
        const base = ctx.createRadialGradient(cx, cx, size * 0.02, cx, cx, cx);
        base.addColorStop(0, "#161a17");
        base.addColorStop(0.7, "#0d0f0e");
        base.addColorStop(1, "#0a0c0b");
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, size, size);

        // 发丝同心圆（--line）
        ctx.strokeStyle = "#55605a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cx, size * 0.34, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cx, size * 0.46, 0, Math.PI * 2);
        ctx.stroke();
        // 内圈虚线圆
        ctx.setLineDash([10, 14]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cx, size * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // acid 强调弧：一段短弧点亮整个标签
        ctx.strokeStyle = "#dfff61";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cx, size * 0.34, -Math.PI / 5, Math.PI / 6.5);
        ctx.stroke();

        // Giant Steps 三 tonic：120° 分布的金色注记 + 刻度
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const chords = [
            { name: "Bmaj7", deg: -90 },
            { name: "E♭maj7", deg: 30 },
            { name: "G♭maj7", deg: 150 },
        ];
        for (const chord of chords) {
            const rad = (chord.deg * Math.PI) / 180;
            ctx.strokeStyle = "#d4a878";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(rad) * size * 0.31, cx + Math.sin(rad) * size * 0.31);
            ctx.lineTo(cx + Math.cos(rad) * size * 0.278, cx + Math.sin(rad) * size * 0.278);
            ctx.stroke();
            ctx.fillStyle = "#d4a878";
            ctx.font = "600 34px Arial";
            ctx.fillText(chord.name, cx + Math.cos(rad) * size * 0.235, cx + Math.sin(rad) * size * 0.235);
        }

        // 中心字标：Georgia 衬线斜体
        ctx.fillStyle = "#eee9dc";
        ctx.font = "italic 700 96px Georgia";
        ctx.fillText("SYCOPHONE", cx, cx - 30);

        // 微标签：大写 + 拉宽字距
        ctx.fillStyle = "#55605a";
        ctx.font = "30px Arial";
        ctx.letterSpacing = "10px";
        ctx.fillText("GIANT STEPS · 33⅓", cx, cx + 62);
        ctx.letterSpacing = "0px";

        // 主轴孔
        ctx.beginPath();
        ctx.arc(cx, cx, size * 0.035, 0, Math.PI * 2);
        ctx.fillStyle = "#070808";
        ctx.fill();
        ctx.strokeStyle = "#55605a";
        ctx.lineWidth = 2;
        ctx.stroke();
    }, 1024);
    map.colorSpace = SRGBColorSpace;
    return map;
}

export function createVinylDisc() {
    const root = new Group();
    const layFlat = new Group();
    layFlat.rotation.x = Math.PI / 2;
    const spinner = new Group();
    layFlat.add(spinner);

    const { map, bump } = grooveTextures();
    const face = new MeshPhysicalMaterial({
        map,
        bumpMap: bump,
        bumpScale: 0.05,
        color: 0xffffff,
        roughness: 0.62,
        metalness: 0,
        clearcoat: 0.12,
        clearcoatRoughness: 0.55,
    });
    const edge = new MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.45,
        metalness: 0.35,
    });
    const vinyl = new Mesh(new CylinderGeometry(RADIUS, RADIUS, 0.07, 160), [edge, face, edge]);
    spinner.add(vinyl);

    const label = new Mesh(
        new CylinderGeometry(RADIUS * 0.34, RADIUS * 0.34, 0.09, 64),
        new MeshStandardMaterial({
            map: labelTexture(),
            roughness: 0.7,
            metalness: 0,
        }),
    );
    label.position.y = 0.012;
    spinner.add(label);

    const spindle = new Mesh(
        new CylinderGeometry(0.055, 0.07, 0.22, 24),
        new MeshStandardMaterial({ color: 0xd5d5d5, metalness: 0.9, roughness: 0.22 }),
    );
    spindle.rotation.x = Math.PI / 2;
    spindle.position.z = 0.08;

    root.add(layFlat, spindle);
    return { root, spinner };
}
