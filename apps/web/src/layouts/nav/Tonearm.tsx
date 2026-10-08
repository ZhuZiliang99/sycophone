import {
    BoxGeometry,
    CylinderGeometry,
    Group,
    Mesh,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    SphereGeometry,
} from "three";

/** 唱臂参数（场景 z 轴向上；aim 组局部 +x 指向针尖） */
export const TONEARM = {
    /** 枢轴离盘面的高度 */
    hubHeight: 0.5,
    /** 枢轴到针尖的臂长（决定针尖落在唱片的哪一圈纹路上） */
    armLength: 3.2,
} as const;

export function createTonearm() {
    const root = new Group();

    // 磨砂树脂：底座
    const shell = new MeshPhysicalMaterial({
        color: 0x1b1d1c,
        metalness: 0.25,
        roughness: 0.72,
        clearcoat: 0.5,
        clearcoatRoughness: 0.6,
    });
    // 拉丝枪灰金属：臂管与活动件
    const brushed = new MeshPhysicalMaterial({
        color: 0x43483f,
        metalness: 0.92,
        roughness: 0.42,
        clearcoat: 0.35,
        clearcoatRoughness: 0.55,
    });
    // 黄铜：配重与唱针
    const brass = new MeshPhysicalMaterial({
        color: 0xc9973f,
        metalness: 1,
        roughness: 0.35,
        clearcoat: 0.25,
        clearcoatRoughness: 0.4,
    });

    // 底座与支柱：把唱臂架到盘面上方
    const base = new Mesh(new CylinderGeometry(0.3, 0.34, 0.1, 32), shell);
    base.rotation.x = Math.PI / 2;
    base.position.z = 0.05;
    root.add(base);

    const column = new Mesh(new CylinderGeometry(0.07, 0.09, 0.36, 20), shell);
    column.rotation.x = Math.PI / 2;
    column.position.z = 0.28;
    root.add(column);

    // 转向组：绕枢轴（z 轴）水平转动，0 度时指向 +x
    const aim = new Group();
    aim.position.z = TONEARM.hubHeight;
    root.add(aim);

    const hub = new Mesh(new CylinderGeometry(0.12, 0.14, 0.16, 24), brushed);
    hub.rotation.x = Math.PI / 2;
    aim.add(hub);

    // 配重块：枢轴后方（-x），黄铜点缀
    const counterweight = new Mesh(new CylinderGeometry(0.15, 0.15, 0.26, 24), brass);
    counterweight.rotation.z = -Math.PI / 2;
    counterweight.position.x = -0.55;
    aim.add(counterweight);

    // 抬臂组：绕枢轴俯仰（y 轴），负责唱针抬起 / 落下
    const lift = new Group();
    aim.add(lift);

    const tubeLength = TONEARM.armLength - 0.32;
    const tube = new Mesh(new CylinderGeometry(0.032, 0.05, tubeLength, 16), brushed);
    tube.rotation.z = -Math.PI / 2;
    tube.position.x = 0.12 + tubeLength / 2;
    lift.add(tube);

    // 唱头：末端微微内倾
    const headshell = new Mesh(new BoxGeometry(0.2, 0.09, 0.08), brushed);
    headshell.position.x = TONEARM.armLength - 0.1;
    headshell.rotation.z = 0.3;
    lift.add(headshell);

    // 唱针：锥形，细端朝下，针尖悬在盘面上方一点
    const needle = new Mesh(new CylinderGeometry(0.004, 0.018, 0.4, 10), brass);
    needle.rotation.x = -Math.PI / 2;
    needle.position.set(TONEARM.armLength - 0.13, 0, -0.23);
    lift.add(needle);

    // 针尖光点：全场唯一的 acid 绿
    const tip = new Mesh(
        new SphereGeometry(0.028, 12, 12),
        new MeshStandardMaterial({
            color: 0xdfff61,
            emissive: 0xdfff61,
            emissiveIntensity: 1.6,
            roughness: 0.4,
        }),
    );
    tip.position.set(TONEARM.armLength - 0.13, 0, -0.42);
    lift.add(tip);

    return { root, aim, lift, tip };
}
